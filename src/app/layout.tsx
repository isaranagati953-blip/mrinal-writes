import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // Generic title — nothing revealing
  title: "Home",
  description: "",
  robots: { index: false, follow: false }, // tell crawlers to stay out
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
