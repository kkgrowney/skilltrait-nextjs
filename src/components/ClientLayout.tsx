"use client";
import { usePathname } from "next/navigation";
import NavPrelogin from "@/components/nav_prelogin";
import { useAuth } from "@/contexts/AuthContext";
import SideNavigation from "@/components/SideNavigation";
import ViewTitle from "@/components/ViewTitle";
import { Toaster } from "react-hot-toast";

const IFRAME_ROUTES = [
  "/",
  "/achievements",
  "/award-templates",
  "/pricing",
  "/company-verification",
  "/detail-achievements",
  "/legal/privacy",
  "/legal/terms",
  "/legal/eula",
  "/email-verification",
  "/not-found",
  "/unauthorized",
  "/employees",
];

const AUTHENTICATED_ROUTES = [
  "/home",
  "/profileEdit",
  "/team",
  "/teamEdit",
  "/digital-awards-generator",
];

const AUTH_ROUTES = ["/signin", "/signup"];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isIframeRoute = IFRAME_ROUTES.includes(pathname);
  const isAuthenticatedRoute = AUTHENTICATED_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Show NavPrelogin only if user is not authenticated and not on an iframe route
  const shouldShowNavPrelogin = !user && !loading && !isIframeRoute;

  // Show authenticated layout if user is authenticated and on an authenticated route
  const shouldShowAuthenticatedLayout =
    user && !loading && isAuthenticatedRoute;

  return (
    <div className={`min-h-screen ${isAuthRoute ? "" : "bg-gray-100"}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000, // 4s default + 2s
        }}
      />
      {shouldShowNavPrelogin && <NavPrelogin />}
      {shouldShowAuthenticatedLayout ? (
        <div
          className="min-h-screen relative z-[90]"
          style={{ backgroundColor: "#1A1D21" }}
        >
          <SideNavigation />
          <div className="h-full flex flex-col">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
