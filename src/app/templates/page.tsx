"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import SideNavigation from "@/components/SideNavigation";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Helper function to get proxied image URLs (same as in profile page)
const getProxiedUrlForPreview = (imageUrl: string): string => {
  if (!imageUrl) return "";
  return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
};

export default function TemplatesListPage() {
  const { user, loading } = useAuth();
  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.uid) return;
    setIsLoading(true);
    const templatesRef = collection(db, "users", user.uid, "template");
    const q = query(templatesRef, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items: any[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setTemplatesList(items);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: "#1A1D21" }}>
        <SideNavigation />
        <div className="md:ml-[66px] ml-0 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
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
                <h1 className="text-2xl font-bold text-white">
                  Your Templates
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {selectMode && (
                  <>
                    <button
                      type="button"
                      className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
                      onClick={() => {
                        setSelectedIds(new Set());
                        setSelectMode(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={selectedIds.size === 0}
                      onClick={() => setShowConfirmModal(true)}
                      className={`px-3 py-1 text-xs rounded text-white ${
                        selectedIds.size === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:opacity-90"
                      }`}
                      style={{ backgroundColor: "#ED6568" }}
                    >
                      Confirm Delete ({selectedIds.size})
                    </button>
                  </>
                )}
                {!selectMode && (
                  <button
                    type="button"
                    className="px-3 py-1 text-xs text-white rounded hover:opacity-90 transition-colors"
                    style={{ backgroundColor: "#ED6568" }}
                    onClick={() => {
                      setSelectedIds(new Set());
                      setSelectMode(true);
                    }}
                  >
                    Delete Templates
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="text-gray-400">Loading...</div>
            ) : templatesList.length === 0 ? (
              <div className="text-gray-400">No templates yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start pb-6 h-full">
                {templatesList.map((template) => {
                  const isSelected = selectedIds.has(template.id);
                  const cardClasses = `w-full transition-opacity bg-white rounded ${
                    selectMode ? "cursor-pointer" : "hover:opacity-80"
                  }`;
                  const borderStyle = {
                    borderRadius: "4px",
                    aspectRatio: "5/4" as any,
                    border: isSelected ? "2px solid #00DF71" : undefined,
                  };
                  const content = (
                    <div className="relative w-full h-full">
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
                  );
                  return selectMode ? (
                    <div
                      key={template.id}
                      className={cardClasses}
                      style={borderStyle}
                      onClick={() => {
                        const next = new Set(selectedIds);
                        if (next.has(template.id)) next.delete(template.id);
                        else next.add(template.id);
                        setSelectedIds(next);
                      }}
                    >
                      {content}
                    </div>
                  ) : (
                    <Link
                      key={template.id}
                      href={`/templates/${template.id}`}
                      className={cardClasses}
                      style={borderStyle}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212327] rounded-lg p-6 max-w-md w-full mx-4 border border-[#454446]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                Delete Templates
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete {selectedIds.size} template
                {selectedIds.size !== 1 ? "s" : ""}?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!user?.uid || selectedIds.size === 0) return;
                    setIsDeleting(true);
                    try {
                      const ids = Array.from(selectedIds);
                      await Promise.all(
                        ids.map((id) =>
                          deleteDoc(doc(db, "users", user.uid, "template", id))
                        )
                      );
                      setSelectedIds(new Set());
                      setSelectMode(false);
                      setShowConfirmModal(false);
                    } catch (e) {
                      console.error("Bulk delete failed:", e);
                      alert(
                        "Failed to delete some templates. Please try again."
                      );
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium transition-colors bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
