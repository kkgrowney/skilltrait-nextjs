"use client";
import { usePathname } from "next/navigation";
import NavPrelogin from "@/components/nav_prelogin";

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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNav = IFRAME_ROUTES.includes(pathname);
  return (
    <>
      {!hideNav && <NavPrelogin />}
      {children}
    </>
  );
}
