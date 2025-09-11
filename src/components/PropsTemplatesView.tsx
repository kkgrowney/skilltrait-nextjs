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
import Link from "next/link";

// Helper function to get proxied image URLs
const getProxiedUrlForPreview = (imageUrl: string): string => {
  if (!imageUrl) return "";
  return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
};

interface PropsTemplatesViewProps {
  showDeleteButtons?: boolean;
  onPropClick?: (prop: any) => void;
}

export default function PropsTemplatesView({ 
  showDeleteButtons = false, 
  onPropClick 
}: PropsTemplatesViewProps) {
  const { user, loading } = useAuth();
  const [propsList, setPropsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.uid) return;
    setIsLoading(true);
    const propsRef = collection(db, "users", user.uid, "props");
    const q = query(propsRef, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items: any[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setPropsList(items);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const handlePropClick = (prop: any) => {
    if (onPropClick) {
      onPropClick(prop);
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Your Props</h1>
          {showDeleteButtons && (
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
                  Delete Props
                </button>
              )}
            </div>
          )}
        </div>

        {/* Props Grid */}
        {isLoading ? (
          <div className="text-gray-400">Loading...</div>
        ) : propsList.length === 0 ? (
          <div className="text-gray-400">No props yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start pb-6 h-full">
            {propsList.map((prop) => {
              const isSelected = selectedIds.has(prop.id);
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
                  {/* Use the saved Cloudinary preview image if available, otherwise fallback to base64 */}
                  {prop.previewImageUrl ? (
                    <img
                      src={prop.previewImageUrl}
                      alt={prop.propsTitle || "Prop"}
                      className="relative z-20 w-full h-full"
                      style={{
                        borderRadius: "4px",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : prop.previewImageBase64 ? (
                    <img
                      src={prop.previewImageBase64}
                      alt={prop.propsTitle || "Prop"}
                      className="relative z-20 w-full h-full"
                      style={{
                        borderRadius: "4px",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : prop.achievement?.backgroundImage ||
                    prop.achievement?.props ? (
                    /* Fallback: Reconstruct from template data like in preview */
                    <>
                      {/* Background layer (props background 600x400) */}
                      <div
                        className="absolute inset-0 z-10 overflow-hidden"
                        style={{ borderRadius: "4px" }}
                      >
                        <img
                          src={getProxiedUrlForPreview(
                            prop.achievement?.backgroundImage || ""
                          )}
                          alt={prop.propsTitle || ""}
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
                          prop.achievement?.props || ""
                        )}
                        alt={prop.propsTitle || ""}
                        className="relative z-20 w-full h-full"
                        style={{
                          borderRadius: "4px",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
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
                          {prop.achievement?.logoImage ? (
                            <img
                              src={getProxiedUrlForPreview(
                                prop.achievement.logoImage
                              )}
                              alt="Logo"
                              className="object-cover relative z-20"
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
                            {prop.propsTitle || ""}
                          </div>
                        </div>
                      </div>
                      {/* Message overlay - positioned like preview (y=92) */}
                      {(prop.achievement?.fromName ||
                        prop.achievement?.fromMessage ||
                        prop.achievement?.fromDate) && (
                        <div className="absolute top-10 left-2 z-30">
                          <div className="bg-gradient-to-r from-[#ADAFBE] via-[#4F7295] to-[#ADAFBE] bg-opacity-80 text-white text-xs px-3 py-2 rounded w-[75%]">
                            {/* From name and date on same line with flex justify-between */}
                            {(prop.achievement?.fromName ||
                              prop.achievement?.fromDate) && (
                              <div className="flex justify-between items-center mb-1">
                                {prop.achievement?.fromName && (
                                  <div className="font-medium">
                                    From: {prop.achievement.fromName}
                                  </div>
                                )}
                                {prop.achievement?.fromDate && (
                                  <div>
                                    {(() => {
                                      const [year, month, day] =
                                        prop.achievement.fromDate.split(
                                          "-"
                                        );
                                      return `${month}/${day}/${year.slice(
                                        2
                                      )}`;
                                    })()}
                                  </div>
                                )}
                              </div>
                            )}
                            {prop.achievement?.fromMessage && (
                              <div className="mt-1">
                                {prop.achievement.fromMessage}
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
                        <div className="text-xs mt-1">
                          {prop.propsTitle || "Prop"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
              return selectMode ? (
                <div
                  key={prop.id}
                  className={cardClasses}
                  style={borderStyle}
                  onClick={() => {
                    const next = new Set(selectedIds);
                    if (next.has(prop.id)) next.delete(prop.id);
                    else next.add(prop.id);
                    setSelectedIds(next);
                  }}
                >
                  {content}
                </div>
              ) : onPropClick ? (
                <div
                  key={prop.id}
                  className={cardClasses}
                  style={borderStyle}
                  onClick={() => handlePropClick(prop)}
                >
                  {content}
                </div>
              ) : (
                <Link
                  key={prop.id}
                  href={`/props/${prop.id}`}
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

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212327] rounded-lg p-6 max-w-md w-full mx-4 border border-[#454446]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                Delete Props
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete {selectedIds.size} prop
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
                          deleteDoc(doc(db, "users", user.uid, "props", id))
                        )
                      );
                      setSelectedIds(new Set());
                      setSelectMode(false);
                      setShowConfirmModal(false);
                    } catch (e) {
                      console.error("Bulk delete failed:", e);
                      alert("Failed to delete some props. Please try again.");
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
