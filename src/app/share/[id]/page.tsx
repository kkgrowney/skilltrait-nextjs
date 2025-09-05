"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";
import {
  downloadPropAsPNG,
  downloadImageDirectly,
  downloadFirebaseImage,
} from "@/lib/downloadUtils";

// Type for prop data
interface PropData {
  id: string;
  userDisplayName?: string;
  propsTitle?: string;
  previewImageUrl?: string;
  previewImageBase64?: string;
  achievement?: {
    fromName?: string;
    fromMessage?: string;
    fromDate?: string;
    backgroundImage?: string;
    props?: string;
    logoImage?: string;
    company?: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

// Helper function to get proxied image URLs
const getProxiedUrlForPreview = (imageUrl: string): string => {
  if (!imageUrl) return "";
  return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
};

// Download function for preview image (same as Prop Detail page)
const handleDownloadProp = async (prop: PropData) => {
  // Prioritize previewImageUrl (Cloudinary) over other image sources
  const imageUrl =
    prop.previewImageUrl ||
    prop.previewImageBase64 ||
    prop.fullPropImage ||
    "/liquid_death_props.png";
  const filename = `${prop.propsTitle || "prop"}-${Date.now()}.png`;

  console.log("Attempting to download:", { imageUrl, filename });

  try {
    // For Cloudinary URLs, use fetch and blob download
    if (
      imageUrl.includes("cloudinary.com") ||
      imageUrl.includes("res.cloudinary.com")
    ) {
      console.log("Using Cloudinary download method");

      try {
        // Fetch the image as a blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Create a blob URL
        const blobUrl = window.URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL
        window.URL.revokeObjectURL(blobUrl);

        return;
      } catch (error) {
        console.error("Cloudinary download failed:", error);
        // Fall through to other methods
      }
    }

    // For Firebase Storage URLs, use the optimized download
    if (imageUrl.includes("firebasestorage.googleapis.com")) {
      console.log("Using Firebase download method");
      await downloadFirebaseImage(imageUrl, filename);

      // Show user instructions for the new tab approach
      setTimeout(() => {
        alert(
          `A new tab has opened with your image. To download:\n\n1. Right-click on the image in the new tab\n2. Select "Save image as..."\n3. Choose your download location\n4. Save as: ${filename}`
        );
      }, 500);

      return;
    }

    // For base64 images, try direct download
    if (imageUrl.startsWith("data:image")) {
      console.log("Using base64 download method");
      await downloadImageDirectly(imageUrl, filename);
      return;
    }

    // Try high-resolution canvas download for other URLs
    console.log("Using canvas download method");
    await downloadPropAsPNG(imageUrl, prop.propsTitle);
  } catch (error) {
    console.error("Primary download failed, trying fallback:", error);

    try {
      // Fallback to direct download
      console.log("Using fallback download method");
      await downloadImageDirectly(imageUrl, filename);
    } catch (fallbackError) {
      console.error("Fallback download also failed:", fallbackError);
      alert("Failed to download prop. Please try again.");
    }
  }
};


// Main component
export default function PublicSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [prop, setProp] = useState<PropData | null>(null);
  const [loading, setLoading] = useState(true);
  const [propId, setPropId] = useState<string | null>(null);

  useEffect(() => {
    const loadProp = async () => {
      try {
        const { id } = await params;
        setPropId(id);
        
        // Get prop data
        const propDoc = await getDoc(doc(db, "publicProps", id));

        if (!propDoc.exists()) {
          notFound();
        }

        const propData: PropData = { id: propDoc.id, ...propDoc.data() };
        setProp(propData);
      } catch (error) {
        console.error("Error loading prop:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    loadProp();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!prop) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Props from{" "}
            {prop.userDisplayName || prop.achievement?.fromName || "Someone"}
          </h1>
          {prop.propsTitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-bold">
              {prop.propsTitle}
            </p>
          )}
          {prop.achievement?.fromMessage && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {prop.achievement.fromMessage}
            </p>
          )}
          {prop.achievement?.fromDate && (
            <p className="text-sm text-gray-500 mt-2">
              Sent on{" "}
              {new Date(prop.achievement.fromDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Prop Image */}
        <div className="mx-auto overflow-hidden mb-4">
          <div className="relative">
            {/* Use the saved Cloudinary preview image if available, otherwise fallback to base64 */}
            {prop.previewImageUrl ? (
              <img
                src={prop.previewImageUrl}
                alt={prop.propsTitle || "Prop"}
                style={{ width: "600px", height: "auto" }}
                className="object-cover mx-auto rounded"
              />
            ) : prop.previewImageBase64 ? (
              <img
                src={prop.previewImageBase64}
                alt={prop.propsTitle || "Prop"}
                className="w-full h-full object-cover rounded"
              />
            ) : prop.achievement?.backgroundImage ||
                prop.achievement?.props ? (
                /* Fallback: Reconstruct from template data like in preview */
                <>
                  {/* Background layer (props background 600x400) */}
                  <div className="absolute inset-0 z-10 overflow-hidden rounded">
                    <img
                      src={getProxiedUrlForPreview(
                        prop.achievement?.backgroundImage || ""
                      )}
                      alt={prop.propsTitle || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Foreground props image */}
                  <img
                    src={getProxiedUrlForPreview(prop.achievement?.props || "")}
                    alt={prop.propsTitle || ""}
                    className="relative z-20 w-full h-full object-cover rounded"
                  />
                  {/* White header with logo/company - matching Dollar Shave Club design */}
                  <div
                    className="absolute top-0 left-0 right-0 bg-white border-b border-[#E4E4E4] z-30"
                    style={{
                      height: "60px",
                    }}
                  >
                    <div
                      className="absolute flex items-center gap-3 px-4 justify-between"
                      style={{
                        height: "100%",
                        width: "100%",
                        left: 0,
                        top: 0,
                      }}
                    >
                      {prop.achievement?.logoImage ? (
                        <img
                          src={getProxiedUrlForPreview(
                            prop.achievement.logoImage
                          )}
                          alt="Logo"
                          className="object-contain relative z-20"
                          style={{
                            height: "40px",
                            maxWidth: "250px",
                            width: "auto",
                            objectPosition: "left",
                            objectFit: "contain",
                          }}
                        />
                      ) : null}
                      <div
                        className="text-black font-medium text-[25px]"
                        style={{ maxWidth: "70%" }}
                      >
                        {prop.propsTitle || ""}
                      </div>
                    </div>
                  </div>
                  {/* Message overlay - matching Dollar Shave Club design */}
                  {(prop.achievement?.fromName ||
                    prop.achievement?.fromMessage ||
                    prop.achievement?.fromDate) && (
                    <div className="absolute top-20 left-4 z-30">
                      <div className="bg-white bg-opacity-90 text-black p-3 rounded-lg shadow-lg max-w-xs">
                        {prop.achievement?.fromName && (
                          <div className="font-semibold text-sm mb-1">
                            From: {prop.achievement.fromName}
                          </div>
                        )}
                        {prop.achievement?.fromMessage && (
                          <div className="text-sm mb-2">
                            {prop.achievement.fromMessage}
                          </div>
                        )}
                        {prop.achievement?.fromDate && (
                          <div className="text-xs text-gray-500 text-right">
                            {new Date(
                              prop.achievement.fromDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Fallback: Show placeholder when no images available */
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded">
                  <div className="text-gray-500 text-sm text-center">
                    <div>No Preview Available</div>
                    <div className="text-[25px] font-medium mt-1">
                      {prop.propsTitle || "Prop"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Download Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => handleDownloadProp(prop)}
            className="bg-[#00DF71] text-[#212327] px-6 py-3 rounded-lg font-semibold hover:bg-[#0AFB84] transition-colors flex items-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-[#212327]"
            >
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Download Props
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p>
            Powered by <span className="font-semibold">SkillTrait</span>
          </p>
          <p className="text-sm mt-1">
            Create and share your own props at{" "}
            <a
              href="https://www.skilltrait.com/digital-awards-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              skilltrait.com
            </a>
          </p>
        </div>
        </div>
      </div>
    );
}
