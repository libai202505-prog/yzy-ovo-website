"use client";

import Link from "next/link";
import SiteNav from "../../components/SiteNav";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

type PostItem = {
  title: string;
  date: string;
  tag: string;
  href: string;
  read?: boolean;
};

const posts: PostItem[] = [
  { title: "建站记录 & 蓝色主题实验", date: "2026-05-16", tag: "Website", href: "/posts/site-log", read: true },
  { title: "天气网页项目整理", date: "2026-05-12", tag: "Project", href: "/projects" },
  { title: "Markdown 写作工作流", date: "2026-04-22", tag: "Notes", href: "/write" },
  { title: "个人 Wiki 页面结构记录", date: "2026-04-19", tag: "Website", href: "/about" },
  { title: "生活碎片收藏夹", date: "2026-03-16", tag: "Life", href: "/write", read: true },
  { title: "前端卡片排版实验", date: "2026-03-04", tag: "Frontend", href: "/write" },
  { title: "公开留言与点赞后端", date: "2026-02-04", tag: "Backend", href: "/write" },
  { title: "学习资料归档计划", date: "2025-12-02", tag: "Study", href: "/share" },
  { title: "我的十多篇文章整合", date: "2025-07-18", tag: "Summary", href: "/write" },
  { title: "DeepSeek 模型能力笔记", date: "2025-02-14", tag: "AI", href: "/write" },
  { title: "C++ 学习分享", date: "2024-12-28", tag: "Programming", href: "/write" },
  { title: "从 VAE 到 Flow Matching", date: "2024-03-28", tag: "GenerativeAI", href: "/write" },
  { title: "LLM 的温水煮青蛙", date: "2023-12-18", tag: "LLM", href: "/write" },
  { title: "LLM 核心论文 23 篇", date: "2023-11-07", tag: "AI", href: "/write" }
];

const tabs = ["日", "周", "月", "年", "分类"] as const;
type Tab = (typeof tabs)[number];

function formatMonthDay(date: string) {
  const [, month, day] = date.split("-");
  return `${month}-${day}`;
}

function groupByYear(items: PostItem[]) {
  return items.reduce<Record<string, PostItem[]>>((groups, item) => {
    const year = item.date.slice(0, 4);
    groups[year] = [...(groups[year] ?? []), item];
    return groups;
  }, {});
}

function groupByMonth(items: PostItem[]) {
  return items.reduce<Record<string, PostItem[]>>((groups, item) => {
    const month = item.date.slice(0, 7);
    groups[month] = [...(groups[month] ?? []), item];
    return groups;
  }, {});
}

function groupByTag(items: PostItem[]) {
  return items.reduce<Record<string, PostItem[]>>((groups, item) => {
    groups[item.tag] = [...(groups[item.tag] ?? []), item];
    return groups;
  }, {});
}

function RevealBlock({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`scroll-reveal ${visible ? "visible" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function PostsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("年");
  const [showAll, setShowAll] = useState(false);

  const groups = useMemo(() => {
    if (activeTab === "分类") {
      const byTag = groupByTag(posts);
      return Object.entries(byTag).map(([label, items]) => ({ label, items }));
    }
    if (activeTab === "月") {
      const byMonth = groupByMonth(posts);
      return Object.entries(byMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([label, items]) => ({ label, items }));
    }
    if (activeTab === "日") {
      return [{ label: "最近更新", items: posts.slice(0, 8) }];
    }
    if (activeTab === "周") {
      return [
        { label: "本周附近", items: posts.slice(0, 4) },
        { label: "更早一些", items: posts.slice(4, 10) }
      ];
    }
    const byYear = groupByYear(posts);
    return Object.entries(byYear)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([label, items]) => ({ label, items }));
  }, [activeTab]);

  const visibleGroups = showAll ? groups : groups.slice(0, 3);

  return (
    <main className="sub-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav />
      <section className="mx-auto max-w-5xl">
        <div className="posts-switch mx-auto mb-8 flex w-max max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-white/70 bg-white/45 p-1 shadow-lg shadow-slate-300/20 backdrop-blur-xl">
          {tabs.map((tab) => (
            <button key={tab} type="button" className={activeTab === tab ? "posts-tab active" : "posts-tab"} onClick={() => { setActiveTab(tab); setShowAll(false); }}>
              {tab}
            </button>
          ))}
        </div>

        <div className="posts-timeline-space">
          {visibleGroups.map((group, index) => (
            <RevealBlock key={`${activeTab}-${group.label}`} delay={index * 90}>
              <section className="timeline-year-card glass-panel">
                <div className="timeline-year-head">
                  <h2>{group.label}</h2>
                  <span>{group.items.length} 篇文章</span>
                </div>
                <div className="timeline-list">
                  {group.items.map((post, postIndex) => (
                    <Link key={`${post.date}-${post.title}`} href={post.href} className="timeline-row" style={{ transitionDelay: `${postIndex * 35}ms` }}>
                      <time>{activeTab === "分类" ? post.date.slice(0, 7) : formatMonthDay(post.date)}</time>
                      <span className="timeline-dot" aria-hidden="true" />
                      <strong>{post.title}</strong>
                      {post.read ? <small>已阅读</small> : null}
                      <em>#{post.tag}</em>
                    </Link>
                  ))}
                </div>
              </section>
            </RevealBlock>
          ))}
        </div>

        {groups.length > visibleGroups.length ? (
          <div className="mt-8 flex justify-center">
            <button type="button" className="more-posts-button" onClick={() => setShowAll(true)}>
              <span>⌄</span> 更多
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
