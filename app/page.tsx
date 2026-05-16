"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Lang = "zh" | "en";

const copy = {
  zh: {
    nav: ["首页", "日志", "项目", "友链"],
    badge: "Personal Wiki · Blog · Projects",
    title: "这里是 yzy-ovo 的浅蓝色小宇宙。",
    subtitle:
      "用温柔的渐变蓝，收藏生活碎片、学习笔记、项目记录和喜欢的链接。慢慢写，慢慢长大。",
    primary: "开始阅读",
    secondary: "查看项目",
    statusTitle: "现在",
    status:
      "正在搭建一个属于自己的双语个人网站。先放上首页、文章入口、项目卡片和友链，之后可以继续扩展 Markdown 博客。",
    cards: [
      { title: "Blog", text: "记录日常、技术、灵感与碎碎念。", meta: "12 notes" },
      { title: "Projects", text: "展示正在做或已经完成的小项目。", meta: "4 works" },
      { title: "Wiki", text: "把常用资料和知识整理成自己的资料库。", meta: "always updating" }
    ],
    postsTitle: "最新文章",
    posts: [
      ["欢迎来到 yzy-ovo", "第一篇文章可以写建站记录、关于自己，或者为什么想拥有这个网站。"],
      ["我的收藏夹", "把喜欢的网站、工具、图片风格、教程资料都放在这里。"],
      ["浅蓝色主题实验", "记录配色、字体、布局和小组件的调整过程。"]
    ],
    linksTitle: "友链 / Links",
    links: ["Design Notes", "Anime Gallery", "Study Wiki", "Tiny Tools"],
    footer: "Made with Next.js · Deployed on Vercel · yzy-ovo.com"
  },
  en: {
    nav: ["Home", "Journal", "Projects", "Links"],
    badge: "Personal Wiki · Blog · Projects",
    title: "Welcome to yzy-ovo's soft blue universe.",
    subtitle:
      "A gentle bilingual space for notes, projects, memories, bookmarks, and everything worth keeping.",
    primary: "Start reading",
    secondary: "View projects",
    statusTitle: "Now",
    status:
      "Building a personal bilingual website with a soft gradient-blue style. The first version includes a homepage, posts, project cards, and links.",
    cards: [
      { title: "Blog", text: "Thoughts, daily notes, tech logs, and tiny ideas.", meta: "12 notes" },
      { title: "Projects", text: "A place for finished work and ongoing experiments.", meta: "4 works" },
      { title: "Wiki", text: "A personal knowledge base that keeps growing.", meta: "always updating" }
    ],
    postsTitle: "Latest Posts",
    posts: [
      ["Welcome to yzy-ovo", "The first post can be about this website, yourself, or why you wanted a personal space."],
      ["My Bookmarks", "Collect favorite websites, tools, visual references, and tutorials here."],
      ["Soft Blue Theme Lab", "Document the process of adjusting colors, typography, layouts, and widgets."]
    ],
    linksTitle: "Blogroll / Links",
    links: ["Design Notes", "Anime Gallery", "Study Wiki", "Tiny Tools"],
    footer: "Made with Next.js · Deployed on Vercel · yzy-ovo.com"
  }
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  const t = copy[lang];
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
      <header className="glass sticky top-4 z-20 flex items-center justify-between rounded-full px-5 py-3 shadow-soft">
        <a href="#home" className="flex items-center gap-3" aria-label="yzy-ovo home">
          <Image
            src="/avatar.webp"
            alt="yzy-ovo avatar"
            width={42}
            height={42}
            priority
            className="rounded-full border border-white/70 object-cover shadow-sm"
          />
          <span className="font-semibold tracking-wide">yzy-ovo</span>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
          {t.nav.map((item) => (
            <a key={item} href="#sections" className="soft-link hover:text-slate-900">
              {item}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          className="rounded-full border border-sky-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
          aria-label="Switch language"
        >
          {lang === "zh" ? "EN" : "中文"}
        </button>
      </header>

      <section id="home" className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
        <div>
          <div className="mb-6 inline-flex items-center rounded-full border border-sky-200/80 bg-white/60 px-4 py-2 text-sm font-medium text-sky-800 shadow-sm backdrop-blur">
            {t.badge}
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-ink sm:text-6xl">
            {t.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{t.subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#posts"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              {t.primary}
            </a>
            <a
              href="#sections"
              className="rounded-full border border-sky-200 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              {t.secondary}
            </a>
          </div>
        </div>

        <aside className="glass relative overflow-hidden rounded-[2rem] p-5 shadow-soft">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-200/55 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-blue-100/80 blur-3xl" />
          <div className="relative rounded-[1.5rem] border border-white/70 bg-white/50 p-4">
            <Image
              src="/avatar.webp"
              alt="yzy-ovo avatar illustration"
              width={640}
              height={640}
              className="aspect-square w-full rounded-[1.35rem] object-cover shadow-sm"
              priority
            />
          </div>
          <div className="relative mt-5 rounded-3xl border border-white/70 bg-white/55 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">{t.statusTitle}</p>
            <p className="mt-3 leading-7 text-slate-600">{t.status}</p>
          </div>
        </aside>
      </section>

      <section id="sections" className="grid gap-5 md:grid-cols-3">
        {t.cards.map((card) => (
          <article key={card.title} className="glass rounded-[1.75rem] p-6 shadow-soft transition hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">{card.meta}</p>
            <h2 className="mt-5 text-2xl font-bold text-ink">{card.title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{card.text}</p>
          </article>
        ))}
      </section>

      <section id="posts" className="grid gap-6 py-16 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Journal</p>
          <h2 className="mt-3 text-3xl font-bold text-ink">{t.postsTitle}</h2>
        </div>
        <div className="space-y-4">
          {t.posts.map(([title, desc], index) => (
            <article key={title} className="glass group rounded-[1.5rem] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-sm font-bold text-sky-800">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-ink group-hover:text-sky-800">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="glass mb-10 rounded-[2rem] p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Friends</p>
            <h2 className="mt-2 text-3xl font-bold text-ink">{t.linksTitle}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {t.links.map((link) => (
              <a
                key={link}
                href="#"
                className="rounded-full border border-sky-200 bg-white/65 px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="pb-8 text-center text-sm text-slate-500">
        © {year} {t.footer}
      </footer>
    </main>
  );
}
