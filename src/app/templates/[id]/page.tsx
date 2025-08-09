"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SideNavigation from "@/components/SideNavigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tpl, setTpl] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid || !params?.id) return;
      setLoading(true);
      const ref = doc(db, "users", user.uid, "templates", params.id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setTpl({ id: snap.id, ...snap.data() });
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Template Detail</h1>
          </div>

          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : !tpl ? (
            <div className="text-gray-400">Not found</div>
          ) : (
            <div className="space-y-4">
              <div className="w-full flex justify-center">
                <div className="relative bg-white rounded" style={{ borderRadius: "4px", width: "100%", maxWidth: "600px", aspectRatio: "5 / 4" }}>
                  <img
                    src={tpl.backgroundUrl || "/liquid_death_props.png"}
                    alt={tpl.company || "Template"}
                    className="object-cover rounded relative z-20 w-full h-full"
                    style={{ borderRadius: "4px", width: "100%", height: "100%", objectPosition: "center" }}
                  />
                  <div className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-200" style={{ height: "20%", zIndex: 50, borderRadius: "4px 4px 0 0" }}>
                    <div className="absolute flex items-center gap-2 px-3" style={{ height: "60%", width: "100%", left: 0, top: "50%", transform: "translateY(-50%)" }}>
                      {tpl.logoUrl ? (
                        <img src={tpl.logoUrl} alt="Logo" className="h-full max-h-full w-auto object-contain" />
                      ) : (
                        <div className="text-xs text-gray-700">No Logo</div>
                      )}
                      <div className="text-black font-medium truncate" style={{ maxWidth: "70%" }}>{tpl.company || "Template"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-4">
                <h3 className="text-lg font-medium text-white mb-3">Use this Template</h3>
                <p className="text-gray-300 text-sm mb-3">Open the wizard prefilled with this logo/background.</p>
                <button
                  className="px-4 py-2 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84]"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (tpl.logoUrl) params.set("logo", encodeURIComponent(tpl.logoUrl));
                    if (tpl.backgroundUrl) params.set("bg", encodeURIComponent(tpl.backgroundUrl));
                    if (tpl.company) params.set("company", encodeURIComponent(tpl.company));
                    if (tpl.basePropsUrl) params.set("base", encodeURIComponent(tpl.basePropsUrl));
                    params.set("step", "props-details");
                    router.push(`/digital-awards-generator?${params.toString()}`);
                  }}
                >
                  Open Wizard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

