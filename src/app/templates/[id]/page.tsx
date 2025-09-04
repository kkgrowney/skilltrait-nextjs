"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SideNavigation from "@/components/SideNavigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { downloadTemplateAsPNG as downloadTemplateUtil } from "@/lib/downloadUtils";

// Helper function to get proxied image URLs (same as in profile page)
const getProxiedUrlForPreview = (imageUrl: string): string => {
  if (!imageUrl) return "";
  return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
};

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [template, setTemplate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const downloadTemplateAsPNG = async () => {
    if (!template) return;

    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas dimensions to match template aspect ratio (5:4)
      const width = 1000;
      const height = 800;
      canvas.width = width;
      canvas.height = height;

      // Create a temporary image to load the background
      const backgroundImg = new Image();
      backgroundImg.crossOrigin = "anonymous";

      backgroundImg.onload = () => {
        // Draw background
        ctx.drawImage(backgroundImg, 0, 0, width, height);

        // Draw white header bar (60px height to match prop detail page)
        const headerHeight = 60;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, headerHeight);

        // Draw border under header
        ctx.strokeStyle = "#E4E4E4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, headerHeight);
        ctx.lineTo(width, headerHeight);
        ctx.stroke();

        // Add company name
        if (template.company) {
          ctx.fillStyle = "black";
          ctx.font = "bold 24px Arial, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(template.company, width - 40, headerHeight * 0.75);
        }

        // Add logo if available
        if (template.logoUrl) {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.onload = () => {
            const logoHeight = 40;
            const logoWidth = Math.min(
              250,
              logoImg.width * (logoHeight / logoImg.height)
            );
            const logoY = (headerHeight - logoHeight) / 2;
            ctx.drawImage(logoImg, 40, logoY, logoWidth, logoHeight);

            // Trigger download
            const link = document.createElement("a");
            link.download = `${
              template.company || "template"
            }-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
          };
          logoImg.src = template.logoUrl;
        } else {
          // Trigger download without logo
          const link = document.createElement("a");
          link.download = `${template.company || "template"}-${Date.now()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      };

      backgroundImg.src = template.backgroundUrl || "/liquid_death_props.png";
    } catch (error) {
      console.error("Error downloading template:", error);
      alert("Failed to download template. Please try again.");
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.uid || !params?.id) return;
      setLoading(true);
      const ref = doc(db, "users", user.uid, "template", params.id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setTemplate({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };
    load();
  }, [user?.uid, params?.id]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1A1D21" }}>
      <SideNavigation />
      <div className="md:ml-[66px] ml-0 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              aria-label="Go back"
              onClick={() => router.back()}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Template Detail</h1>
          </div>

          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : !template ? (
            <div className="text-gray-400">Template not found</div>
          ) : (
            <div className="space-y-4">
              <div className="w-full flex justify-center">
                <div
                  className="relative bg-white rounded"
                  style={{
                    borderRadius: "4px",
                    width: "100%",
                    maxWidth: "600px",
                    aspectRatio: "5 / 4",
                  }}
                >
                  {/* Use the saved preview image if available, otherwise reconstruct from template data */}
                  {template.previewImageBase64 ? (
                    <img
                      src={template.previewImageBase64}
                      alt={template.achievement?.company || "Template"}
                      className="relative z-20 w-full h-full"
                      style={{
                        borderRadius: "4px",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        // objectPosition: "center",
                      }}
                    />
                  ) : template.achievement?.backgroundImage ||
                    template.achievement?.props ? (
                    /* Fallback: Reconstruct from template data like in preview */
                    <>
                      {/* Background layer */}
                      <div
                        className="absolute inset-0 z-10 overflow-hidden"
                        style={{ borderRadius: "4px" }}
                      >
                        <img
                          src={getProxiedUrlForPreview(
                            template.achievement?.backgroundImage || ""
                          )}
                          alt={template.achievement?.company || ""}
                          className="w-full h-full object-cover"
                          style={{
                            borderRadius: "4px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      {/* Foreground props image */}
                      <img
                        src={getProxiedUrlForPreview(
                          template.achievement?.props || ""
                        )}
                        alt={template.achievement?.company || ""}
                        className="relative z-20 w-full h-full"
                        style={{
                          borderRadius: "4px",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          // objectPosition: "center",
                        }}
                      />
                      {/* White header with logo/company - matching prop detail page */}
                      <div
                        className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-30"
                        style={{
                          height: "60px",
                          borderRadius: "4px 4px 0 0",
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
                          {template.achievement?.logoImage ? (
                            <img
                              src={getProxiedUrlForPreview(
                                template.achievement.logoImage
                              )}
                              alt="Logo"
                              className="object-contain relative z-20"
                              style={{
                                borderRadius: "4px",
                                height: "40px",
                                width: "auto",
                                maxWidth: "250px",
                              }}
                            />
                          ) : null}
                          <div
                            className="text-black font-medium truncate text-base"
                            style={{ maxWidth: "70%" }}
                          >
                            {template.achievement?.company || ""}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Fallback: Show placeholder when no images available */
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <div className="text-gray-500 text-sm text-center">
                        <div>No Preview Available</div>
                        <div className="text-xs mt-1">
                          {template.achievement?.company || "Template"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-4 mx-auto"
                style={{ maxWidth: "600px" }}
              >
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
                    onClick={async () => {
                      // Pre-fill localStorage with template data before navigation
                      if (typeof window !== "undefined") {
                        // Create a template object that matches the expected structure
                        const templateData = {
                          id: template.id,
                          achievement: {
                            props: template.achievement?.props || "",
                            logoImage: template.achievement?.logoImage || "",
                            backgroundImage:
                              template.achievement?.backgroundImage || "",
                            company: template.achievement?.company || "",
                            tags: template.achievement?.tags || [],
                          },
                        };

                        // Pre-fill only visual elements (background, logo, props) - not text fields
                        localStorage.setItem(
                          "digital-awards-current-step",
                          "props-details"
                        );
                        localStorage.setItem(
                          "digital-awards-active-tab",
                          "props"
                        );
                        localStorage.setItem(
                          "digital-awards-selected-template",
                          JSON.stringify(templateData)
                        );
                        localStorage.setItem(
                          "digital-awards-show-template-detail",
                          "true"
                        );
                        localStorage.setItem(
                          "digital-awards-logo-visible",
                          "true"
                        );
                        localStorage.setItem(
                          "digital-awards-company-name",
                          template.achievement?.company || ""
                        );
                        localStorage.setItem(
                          "digital-awards-background-visible",
                          "true"
                        );
                        localStorage.setItem(
                          "digital-awards-background-name",
                          template.achievement?.backgroundImage
                            ? "Custom Background"
                            : ""
                        );
                        // Clear text fields so user can fill them fresh
                        localStorage.setItem("digital-awards-props-title", "");
                        localStorage.setItem(
                          "digital-awards-props-recipients",
                          JSON.stringify([])
                        );
                        localStorage.setItem("digital-awards-from-name", "");
                        localStorage.setItem("digital-awards-from-date", "");
                        localStorage.setItem("digital-awards-from-message", "");
                        localStorage.setItem(
                          "digital-awards-filters",
                          JSON.stringify({})
                        );
                        localStorage.setItem("digital-awards-search-query", "");
                      }

                      // Navigate to digital awards generator
                      router.push("/digital-awards-generator");
                    }}
                  >
                    Use Template
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs text-white rounded hover:opacity-90"
                    style={{ backgroundColor: "#ED6568" }}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Template
                  </button>
                </div>
              </div>

              {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-[#212327] rounded-lg p-6 max-w-md w-full mx-4 border border-[#454446]">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Delete Template
                      </h3>
                      <p className="text-gray-300 mb-6">
                        Are you sure you want to delete this template? This
                        action cannot be undone.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setShowDeleteModal(false)}
                          className="px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            if (!user?.uid || !params?.id) return;
                            try {
                              setIsDeleting(true);
                              const ref = doc(
                                db,
                                "users",
                                user.uid,
                                "template",
                                params.id as string
                              );
                              await deleteDoc(ref);
                              setIsDeleting(false);
                              setShowDeleteModal(false);
                              router.push("/templates");
                            } catch (e) {
                              console.error("Failed to delete template:", e);
                              setIsDeleting(false);
                              alert(
                                "Failed to delete template. Please try again."
                              );
                            }
                          }}
                          disabled={isDeleting}
                          className="px-4 py-2 text-sm font-medium text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                          style={{ backgroundColor: "#ED6568" }}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
