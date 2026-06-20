import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

import PWARegistration from "@/components/PWARegistration";

export const metadata: Metadata = {
  title: "Home",
  description: "",
  manifest: "/manifest.json",
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
