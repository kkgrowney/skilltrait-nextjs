"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import SideNavigation from "@/components/SideNavigation";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PropsListPage() {
  const { user, loading } = useAuth();
  const [propsList, setPropsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">Your Props</h1>
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
                    className={`px-3 py-1 text-xs rounded text-white ${selectedIds.size === 0 ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
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
          </div>

          {isLoading ? (
            <div className="text-gray-400">Loading...</div>
          ) : propsList.length === 0 ? (
            <div className="text-gray-400">No props yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start pb-6 h-full">
              {propsList.map((prop) => {
                const isSelected = selectedIds.has(prop.id);
                const cardClasses = `w-full transition-opacity bg-white rounded ${selectMode ? "cursor-pointer" : "hover:opacity-80"}`;
                const borderStyle = {
                  borderRadius: "4px",
                  aspectRatio: "5/4" as any,
                  border: isSelected ? "2px solid #00DF71" : undefined,
                };
                const content = (
                  <img
                    src={prop.fullPropImage || "/liquid_death_props.png"}
                    alt={prop.propsTitle || "Prop"}
                    className="object-contain rounded relative z-20 w-full h-full"
                    style={{ borderRadius: "4px", width: "100%", height: "100%", objectPosition: "bottom" }}
                  />
                );
                return selectMode ? (
                  <div
                    key={prop.id}
                    className={cardClasses}
                    style={borderStyle}
                    onClick={() => {
                      const next = new Set(selectedIds);
                      if (next.has(prop.id)) next.delete(prop.id); else next.add(prop.id);
                      setSelectedIds(next);
                    }}
                  >
                    {content}
                  </div>
                ) : (
                  <Link key={prop.id} href={`/props/${prop.id}`} className={cardClasses} style={borderStyle}>
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
            <h3 className="text-lg font-semibold text-white mb-4">Delete Props</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete {selectedIds.size} prop{selectedIds.size !== 1 ? 's' : ''}?</p>
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
                    await Promise.all(ids.map((id) => deleteDoc(doc(db, 'users', user.uid, 'props', id))));
                    setSelectedIds(new Set());
                    setSelectMode(false);
                    setShowConfirmModal(false);
                  } catch (e) {
                    console.error('Bulk delete failed:', e);
                    alert('Failed to delete some props. Please try again.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium transition-colors bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

