"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavIconKey = "posts" | "projects" | "about" | "share" | "blogroll";

type NavItem = {
  href: string;
  label: string;
  icon: NavIconKey;
};

const navItems: NavItem[] = [
  { href: "/posts", label: "近期文章", icon: "posts" },
  { href: "/projects", label: "我的项目", icon: "projects" },
  { href: "/about", label: "个人介绍", icon: "about" },
  { href: "/share", label: "推荐分享", icon: "share" },
  { href: "/blogroll", label: "优秀博客", icon: "blogroll" }
];

function FloatingIcon({ type }: { type: NavIconKey }) {
  const common = {
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "floating-nav-svg"
  };

  if (type === "posts") {
    return (
      <svg {...common}>
        <path d="M9 6.5h12.5a2.5 2.5 0 0 1 2.5 2.5v17.5H10.5A3.5 3.5 0 0 1 7 23V9a2.5 2.5 0 0 1 2-2.45Z" />
        <path d="M11 6.5v20" />
        <path d="M15 12h5.5" />
        <path d="M15 17h6.5" />
      </svg>
    );
  }

  if (type === "projects") {
    return (
      <svg {...common}>
        <path d="M8 8h5v5H8z" />
        <path d="M19 8h5v5h-5z" />
        <path d="M8 19h5v5H8z" />
        <path d="M19 19h5v5h-5z" />
      </svg>
    );
  }

  if (type === "about") {
    return (
      <svg {...common}>
        <circle cx="16" cy="16" r="10.5" />
        <path d="M11.5 18.2c1.4 2 3 3 4.6 3s3.1-1 4.4-3" />
        <path d="M12.5 13.5h.01" />
        <path d="M19.5 13.5h.01" />
      </svg>
    );
  }

  if (type === "share") {
    return (
      <svg {...common}>
        <path d="m16 5.8 3.1 6.35 7 1.02-5.05 4.9 1.2 6.92L16 21.7l-6.25 3.29 1.2-6.92-5.05-4.9 7-1.02L16 5.8Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="16" cy="16" r="10.5" />
      <path d="M5.5 16h21" />
      <path d="M16 5.5c3 3.2 4.4 6.7 4.4 10.5S19 23.3 16 26.5" />
      <path d="M16 5.5c-3 3.2-4.4 6.7-4.4 10.5S13 23.3 16 26.5" />
    </svg>
  );
}

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
            <FloatingIcon type={item.icon} />
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
