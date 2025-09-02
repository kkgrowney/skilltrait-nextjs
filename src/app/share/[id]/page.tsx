import { Metadata } from "next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";

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

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    // Get prop data for metadata
    const propDoc = await getDoc(doc(db, "publicProps", params.id));

    if (!propDoc.exists()) {
      return {
        title: "Prop Not Found - SkillTrait",
        description:
          "The prop you're looking for doesn't exist or isn't publicly shared.",
      };
    }

    const propData: PropData = propDoc.data() as PropData;
    const displayName =
      propData.userDisplayName || propData.achievement?.fromName || "Someone";
    const message =
      propData.achievement?.fromMessage ||
      "Check out these props sent via SkillTrait!";
    const imageUrl = propData.previewImageUrl || propData.previewImageBase64;
    const shareUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://skilltrait.com"
    }/share/${params.id}`;

    return {
      title: `${displayName} sent props via SkillTrait`,
      openGraph: {
        title: `${displayName} sent props via SkillTrait`,
        images: imageUrl ? [imageUrl] : [],
        url: shareUrl,
        type: "website",
        siteName: "SkillTrait",
      },
      twitter: {
        card: "summary_large_image",
        title: `${displayName} sent props via SkillTrait`,
        images: imageUrl ? [imageUrl] : [],
      },
      alternates: {
        canonical: shareUrl,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Props via SkillTrait",
      description: "Check out these props sent via SkillTrait!",
    };
  }
}

// Main component
export default async function PublicSharePage({
  params,
}: {
  params: { id: string };
}) {
  try {
    // Get prop data
    const propDoc = await getDoc(doc(db, "publicProps", params.id));

    if (!propDoc.exists()) {
      notFound();
    }

    const prop: PropData = { id: propDoc.id, ...propDoc.data() };

    return (
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
    );
  } catch (error) {
    console.error("Error loading prop:", error);
    notFound();
  }
}
