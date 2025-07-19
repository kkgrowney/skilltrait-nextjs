import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import NavigationWrapper from "@/components/NavigationWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillTrait",
  description: "SkillTrait - Professional skill verification platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< Updated upstream
    <html lang="en">
      <head>
        {/* Webflow CSS files */}
        <link rel="stylesheet" type="text/css" href="/skill-trait-webflow/css/normalize.css" />
        <link rel="stylesheet" type="text/css" href="/skill-trait-webflow/css/webflow.css" />
        <link rel="stylesheet" type="text/css" href="/skill-trait-webflow/css/skill-trait.webflow.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Webflow JS */}
        <script src="/skill-trait-webflow/js/webflow.js"></script>
=======
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NavigationWrapper />
          {children}
        </AuthProvider>
>>>>>>> Stashed changes
      </body>
    </html>
  );
}
