"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import SideNavigation from "@/components/SideNavigation";
import { useRouter } from "next/navigation";

export default function TemplatesListPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user?.uid) return;
    setIsLoading(true);
    const ref = collection(db, "users", user.uid, "templates");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items: any[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setTemplates(items);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  return (
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">Your Templates</h1>
            </div>
          </div>

          {isLoading ? (
            <div className="text-gray-400">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="text-gray-400">No templates yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start pb-6 h-full">
              {templates.map((t) => (
                <div 
                  key={t.id} 
                  className="w-full cursor-pointer hover:opacity-80 transition-opacity bg-white rounded" 
                  style={{ borderRadius: "4px", aspectRatio: "5/4" }}
                  onClick={() => router.push(`/templates/${t.id}`)}
                >
                  <div className="relative w-full h-full">
                    <img
                      src={t.backgroundUrl || "/liquid_death_props.png"}
                      alt={t.company || "Template"}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: "4px" }}
                    />
                    <div className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-200" style={{ height: "20%", zIndex: 50, borderRadius: "4px 4px 0 0" }}>
                      <div className="absolute flex items-center gap-2 px-3" style={{ height: "60%", width: "100%", left: 0, top: "50%", transform: "translateY(-50%)" }}>
                        {t.logoUrl ? (
                          <img src={t.logoUrl} alt="Logo" className="h-full max-h-full w-auto object-contain" />
                        ) : (
                          <div className="text-xs text-gray-700">No Logo</div>
                        )}
                        <div className="text-black font-medium truncate" style={{ maxWidth: "70%" }}>{t.company || ""}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

