"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Head from "next/head";

// Helper function to get proxied image URLs
const getProxiedUrlForPreview = (imageUrl: string): string => {
  if (!imageUrl) return "";
  return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
};

export default function PublicSharePage() {
  const params = useParams();
  const [prop, setProp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProp = async () => {
      if (!params.id) {
        setError("No prop ID provided");
        setLoading(false);
        return;
      }

      try {
        // First try to find the prop in the public props collection
        let propDoc = await getDoc(doc(db, "publicProps", params.id as string));

        if (propDoc.exists()) {
          const propData = propDoc.data();
          setProp({ id: propDoc.id, ...propData });
        } else {
          // If not in public props, try to find in user props by searching through all users
          // This is a fallback for props that were created before the public collection was implemented
          // For now, we'll just show an error, but in the future we could implement a search
          setError("Prop not found or not publicly shared");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error loading prop:", err);
        setError("Failed to load prop");
      } finally {
        setLoading(false);
      }
    };

    loadProp();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prop...</p>
        </div>
      </div>
    );
  }

  if (error || !prop) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Prop Not Found
          </h1>
          <p className="text-gray-600">
            {error ||
              "The prop you're looking for doesn't exist or isn't publicly shared."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${
          prop.userDisplayName || prop.achievement?.fromName || "Someone"
        } sent props via SkillTrait`}</title>
        <meta
          property="og:title"
          content={`${
            prop.userDisplayName || prop.achievement?.fromName || "Someone"
          } sent props via SkillTrait`}
        />
        <meta
          property="og:description"
          content={
            prop.achievement?.fromMessage ||
            "Check out these props sent via SkillTrait!"
          }
        />
        <meta
          property="og:image"
          content={prop.previewImageUrl || prop.previewImageBase64}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${
            prop.userDisplayName || prop.achievement?.fromName || "Someone"
          } sent props via SkillTrait`}
        />
        <meta
          name="twitter:description"
          content={
            prop.achievement?.fromMessage ||
            "Check out these props sent via SkillTrait!"
          }
        />
        <meta
          name="twitter:image"
          content={prop.previewImageUrl || prop.previewImageBase64}
        />
      </Head>

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Props from{" "}
              {prop.userDisplayName || prop.achievement?.fromName || "Someone"}
            </h1>
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
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="relative" style={{ aspectRatio: "5/4" }}>
              {/* Use the saved Cloudinary preview image if available, otherwise fallback to base64 */}
              {prop.previewImageUrl ? (
                <img
                  src={prop.previewImageUrl}
                  alt={prop.propsTitle || "Prop"}
                  className="w-full h-full object-cover"
                />
              ) : prop.previewImageBase64 ? (
                <img
                  src={prop.previewImageBase64}
                  alt={prop.propsTitle || "Prop"}
                  className="w-full h-full object-cover"
                />
              ) : prop.achievement?.backgroundImage ||
                prop.achievement?.props ? (
                /* Fallback: Reconstruct from template data like in preview */
                <>
                  {/* Background layer (props background 600x400) */}
                  <div className="absolute inset-0 z-10 overflow-hidden">
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
                    className="relative z-20 w-full h-full object-cover"
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
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
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

          {/* Footer */}
          <div className="text-center text-gray-500">
            <p>
              Powered by <span className="font-semibold">SkillTrait</span>
            </p>
            <p className="text-sm mt-1">
              Create and share your own props at skilltrait.com
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
