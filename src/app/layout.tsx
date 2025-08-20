import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import ClientLayout from "@/components/ClientLayout";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SkillTrait",
  description: "SkillTrait - Professional skill verification platform",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon64.png', sizes: '64x64', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon64.png',
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#1A1D21',
    'msapplication-TileImage': '/favicon64.png',
    'theme-color': '#1A1D21',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon64.png" type="image/png" sizes="64x64" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon64.png" />
        <meta name="msapplication-TileColor" content="#1A1D21" />
        <meta name="msapplication-TileImage" content="/favicon64.png" />
        <meta name="theme-color" content="#1A1D21" />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <AuthProvider>
          <NavigationProvider>
            <ClientLayout>{children}</ClientLayout>
          </NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
