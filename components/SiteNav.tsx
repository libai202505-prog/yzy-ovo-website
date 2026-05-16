"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { href: "/posts", label: "近期文章", icon: "▤" },
  { href: "/projects", label: "我的项目", icon: "◆" },
  { href: "/about", label: "个人介绍", icon: "○" },
  { href: "/share", label: "推荐分享", icon: "☆" },
  { href: "/blogroll", label: "优秀博客", icon: "◎" }
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteNav({ showEdit = true }: { showEdit?: boolean }) {
  const pathname = usePathname();
  const editHref = pathname.startsWith("/about") ? "/about/edit" : "/write";

  return (
    <>
      <nav className="floating-nav" aria-label="Primary navigation">
        <Link href="/" className={isActive(pathname, "/") ? "floating-nav-avatar active" : "floating-nav-avatar"} aria-label="首页">
          <Image src="/avatar.webp" alt="yzy-ovo" width={40} height={40} className="rounded-full object-cover" priority />
        </Link>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "floating-nav-item active" : "floating-nav-item"} aria-label={item.label} title={item.label}>
            <span>{item.icon}</span>
          </Link>
        ))}
      </nav>

      {showEdit ? (
        <Link href={editHref} className={isActive(pathname, editHref) ? "floating-edit active" : "floating-edit"}>
          编辑
        </Link>
      ) : null}
    </>
  );
}
