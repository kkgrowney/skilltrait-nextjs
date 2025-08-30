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

        // Draw white header bar (20% height)
        const headerHeight = height * 0.2;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, headerHeight);

        // Draw border under header
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, headerHeight);
        ctx.lineTo(width, headerHeight);
        ctx.stroke();

        // Add company name
        if (template.company) {
          ctx.fillStyle = "black";
          ctx.font = "bold 48px Arial, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(template.company, 40, headerHeight * 0.75);
        }

        // Add logo if available
        if (template.logoUrl) {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.onload = () => {
            const logoSize = headerHeight * 0.6;
            const logoY = headerHeight * 0.2;
            ctx.drawImage(logoImg, 40, logoY, logoSize, logoSize);

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
                      {/* White header with logo/company (scaled proportionally) */}
                      <div
                        className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-200 z-30"
                        style={{
                          height: "35px",
                          borderRadius: "4px 4px 0 0",
                        }}
                      >
                        <div
                          className="absolute flex items-center gap-1 px-2 justify-between"
                          style={{
                            height: "60%",
                            width: "100%",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
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
                                height: "17px",
                                width: "auto",
                              }}
                            />
                          ) : null}
                          <div
                            className="text-black font-medium truncate text-xs"
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
                <h3 className="text-lg font-medium text-white mb-3">
                  Share Template
                </h3>
                <div className="flex flex-wrap justify-center gap-3 mb-2 sm:gap-4 md:gap-5">
                  {[
                    {
                      label: "Copy",
                      bg: "bg-gray-600 hover:bg-gray-500",
                      icon: (
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H8V7h10v14z" />
                      ),
                    },
                    {
                      label: "Download",
                      bg: "bg-gray-600 hover:bg-gray-500",
                      icon: (
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                      ),
                      onClick: () =>
                        downloadTemplateUtil(
                          template.backgroundUrl || "/liquid_death_props.png",
                          template.company
                        ),
                    },
                    {
                      label: "Share on LinkedIn",
                      bg: "bg-[#0077B5] hover:bg-[#005885]",
                      icon: (
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      ),
                    },
                    {
                      label: "Share on Twitter",
                      bg: "bg-black hover:bg-gray-800",
                      icon: (
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      ),
                    },
                    {
                      label: "Share on Facebook",
                      bg: "bg-[#1877F2] hover:bg-[#166FE5]",
                      icon: (
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      ),
                    },
                  ].map(({ label, bg, icon, onClick }, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`p-3 sm:p-2 md:p-3 rounded-full ${bg} transition-colors flex items-center justify-center`}
                      aria-label={label}
                      onClick={onClick}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-white"
                      >
                        {icon}
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end mt-2 gap-2">
                  <button
                    type="button"
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
                    onClick={async () => {
                      // Navigate user to digital awards generator with template data pre-filled
                      const params = new URLSearchParams();

                      if (template.achievement?.logoImage) {
                        params.set(
                          "logo",
                          encodeURIComponent(template.achievement.logoImage)
                        );
                      }
                      if (template.achievement?.backgroundImage) {
                        params.set(
                          "bg",
                          encodeURIComponent(
                            template.achievement.backgroundImage
                          )
                        );
                      }
                      if (template.achievement?.company) {
                        params.set(
                          "company",
                          encodeURIComponent(template.achievement.company)
                        );
                      }
                      if (template.achievement?.props) {
                        params.set(
                          "base",
                          encodeURIComponent(template.achievement.props)
                        );
                      }

                      // Set step to props-details since user is coming from a template
                      params.set("step", "props-details");

                      // Navigate with template data
                      router.push(
                        `/digital-awards-generator?${params.toString()}`
                      );
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
