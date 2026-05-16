import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "yzy-ovo | Personal Wiki",
  description: "A soft blue bilingual personal wiki dashboard.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
