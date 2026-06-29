import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "留言审核",
  robots: { index: false, follow: false }
};

export default function AdminCommentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}