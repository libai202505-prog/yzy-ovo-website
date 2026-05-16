"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Lang = "zh" | "en";

const copy = {
  zh: {
    status: "开发中",
    menuTitle: "GENERAL",
    nav: ["近期文章", "我的项目", "关于网站", "推荐分享", "优秀博客"],
    write: "写文章",
    greeting: "Good Morning",
    greetingLine: "我是 yzy，很高兴遇见你！",
    latest: "最新文章",
    latestTitle: "建站记录 & 蓝色主题实验",
    latestDesc: "把这个空间做成自己的双语个人 Wiki、博客和项目展示页。",
    dateLabel: "今天",
    project: "随机推荐",
    projectTitle: "yzy-ovo Wiki",
    projectDesc: "收藏灵感、笔记、项目和喜欢的链接。",
    music: "Close To You",
    friends: "友链 / Blogroll",
    about: "关于这里",
    aboutText: "一个浅蓝色渐变的小空间，记录生活碎片、学习笔记、作品和灵感。风格参考了个人 Wiki 的布局，但内容、配色和组件都重新设计为 yzy-ovo。",
    buttons: ["Github", "Bilibili", "小红书", "Email"],
    footer: "Made with Next.js · yzy-ovo"
  },
  en: {
    status: "Building",
    menuTitle: "GENERAL",
    nav: ["Recent Posts", "Projects", "About Site", "Recommendations", "Blogroll"],
    write: "New Post",
    greeting: "Good Morning",
    greetingLine: "I'm yzy, nice to meet you!",
    latest: "Latest Post",
    latestTitle: "Website Log & Soft Blue Theme Lab",
    latestDesc: "Building a bilingual personal wiki, blog, and project showcase.",
    dateLabel: "Today",
    project: "Random Pick",
    projectTitle: "yzy-ovo Wiki",
    projectDesc: "A place for ideas, notes, projects, and favorite links.",
    music: "Close To You",
    friends: "Blogroll / Links",
    about: "About this place",
    aboutText: "A soft gradient-blue space for memories, notes, work, and tiny ideas. Inspired by personal wiki dashboards, redesigned with original yzy-ovo content, colors, and widgets.",
    buttons: ["Github", "Bilibili", "RedNote", "Email"],
    footer: "Made with Next.js · yzy-ovo"
  }
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function MiniCalendar({ now, lang }: { now: Date | null; lang: Lang }) {
  const base = now ?? new Date(2026, 4, 15);
  const year = base.getFullYear();
  const month = base.getMonth();
  const today = base.getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const weekday = ["日", "一", "二", "三", "四", "五", "六"];
  const weekdayEn = ["S", "M", "T", "W", "T", "F", "S"];
  const blanks = Array.from({ length: firstDay }, (_, index) => `blank-${index}`);
  const days = Array.from({ length: totalDays }, (_, index) => index + 1);

  return (
    <div className="calendar-card widget-card">
      <div className="mb-5 flex items-center justify-between text-sm text-slate-500">
        <span>
          {lang === "zh" ? `${year}/${month + 1}/${today}` : `${month + 1}/${today}/${year}`}
        </span>
        <span>{lang === "zh" ? weekday[base.getDay()] : weekdayEn[base.getDay()]}</span>
      </div>
      <div className="grid grid-cols-7 gap-3 text-center text-sm text-slate-500">
        {(lang === "zh" ? ["一", "二", "三", "四", "五", "六", "日"] : ["M", "T", "W", "T", "F", "S", "S"]).map((day) => (
          <span key={day} className="font-medium text-slate-500">
            {day}
          </span>
        ))}
        {blanks.map((blank) => (
          <span key={blank} />
        ))}
        {days.map((day) => (
          <span key={day} className={day === today ? "calendar-active" : "calendar-day"}>
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

function Clock({ now }: { now: Date | null }) {
  const text = now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : "--:--";
  return <div className="clock-card widget-card font-mono text-5xl tracking-[0.08em] text-slate-700 sm:text-6xl">{text}</div>;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  const [now, setNow] = useState<Date | null>(null);
  const t = copy[lang];

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000 * 30);
    return () => window.clearInterval(timer);
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="min-h-screen overflow-hidden px-4 py-6 text-slate-700 sm:px-6 lg:px-10">
      <div className="site-shell mx-auto grid max-w-7xl gap-6 lg:grid-cols-[310px_minmax(420px,1fr)_390px]">
        <aside className="sidebar glass-panel p-7 lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
          <div className="flex items-center gap-4">
            <Image src="/avatar.webp" alt="yzy-ovo avatar" width={56} height={56} priority className="avatar-ring rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-700">yzy-ovo</h1>
                <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-600">{t.status}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Personal Wiki</p>
            </div>
          </div>

          <div className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t.menuTitle}</div>
          <nav className="mt-5 space-y-3">
            {t.nav.map((item, index) => (
              <a key={item} href={`#section-${index}`} className={index === 3 ? "nav-pill is-active" : "nav-pill"}>
                <span className="nav-icon">{["▤", "◇", "○", "★", "◎"][index]}</span>
                <span>{item}</span>
              </a>
            ))}
          </nav>

          <article id="section-0" className="latest-card mt-8 rounded-[2rem] border border-white/70 bg-white/45 p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.latest}</p>
            <div className="mt-4 flex gap-3">
              <Image src="/avatar.webp" alt="latest post" width={62} height={62} className="h-[62px] w-[62px] rounded-2xl object-cover" />
              <div>
                <h2 className="font-semibold leading-snug text-slate-700">{t.latestTitle}</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{t.latestDesc}</p>
              </div>
            </div>
          </article>
        </aside>

        <section className="center-column space-y-6">
          <div className="hero-window glass-panel relative overflow-hidden p-4">
            <div className="hero-art relative h-56 rounded-[2rem] sm:h-72">
              <Image src="/avatar.webp" alt="soft blue illustration" fill sizes="(max-width: 1024px) 100vw, 560px" priority className="object-cover opacity-90" />
              <div className="hero-shine" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_0.74fr]">
            <article className="greeting-card glass-panel p-8 text-center">
              <Image src="/avatar.webp" alt="yzy-ovo avatar" width={126} height={126} priority className="avatar-big mx-auto rounded-full object-cover" />
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-700">{t.greeting}</h2>
              <p className="mx-auto mt-3 max-w-sm text-2xl leading-snug text-slate-700">
                {lang === "zh" ? (
                  <>
                    我是 <span className="text-cyan-500">yzy</span>，很高兴遇见你！
                  </>
                ) : (
                  <>
                    I'm <span className="text-cyan-500">yzy</span>, nice to meet you!
                  </>
                )}
              </p>
            </article>

            <article id="section-1" className="project-card glass-panel flex flex-col justify-between p-7">
              <div>
                <p className="text-sm text-slate-500">{t.project}</p>
                <h3 className="mt-5 text-2xl font-semibold text-slate-700">{t.projectTitle}</h3>
                <p className="mt-3 leading-7 text-slate-500">{t.projectDesc}</p>
              </div>
              <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white/55 p-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-2xl text-cyan-500">✦</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/80">
                  <div className="h-full w-2/3 rounded-full bg-cyan-300" />
                </div>
              </div>
            </article>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {t.buttons.map((button, index) => (
              <a key={button} href="#" className={index === 0 ? "social-button social-dark" : "social-button"}>
                <span>{["●", "▣", "▥", "✉"][index]}</span>
                {button}
              </a>
            ))}
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="language-button">
              {lang === "zh" ? "English" : "中文"}
            </button>
          </div>

          <article id="section-2" className="about-card glass-panel p-7">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-500">About</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-700">{t.about}</h2>
            <p className="mt-4 leading-8 text-slate-500">{t.aboutText}</p>
          </article>
        </section>

        <aside className="right-column space-y-6">
          <div className="flex items-center gap-5">
            <a href="#section-0" className="write-button">
              <span>✎</span>
              {t.write}
            </a>
            <div className="dot-grid" aria-hidden="true" />
          </div>

          <Clock now={now} />
          <MiniCalendar now={now} lang={lang} />

          <article id="section-3" className="music-card glass-panel flex items-center gap-5 p-5">
            <span className="text-4xl text-cyan-400">♪</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-slate-500">{t.music}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-cyan-400" />
                <div className="h-2 flex-1 rounded-full bg-white/70">
                  <div className="h-full w-1/3 rounded-full bg-cyan-300" />
                </div>
              </div>
            </div>
            <button className="play-button" aria-label="play" type="button">▶</button>
          </article>

          <article id="section-4" className="friends-card glass-panel p-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-500">Friends</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-700">{t.friends}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {["Lvy style", "Design", "Study", "Gallery"].map((friend) => (
                <a key={friend} href="#" className="friend-pill">{friend}</a>
              ))}
            </div>
          </article>
        </aside>
      </div>

      <footer className="mx-auto mt-8 max-w-7xl pb-4 text-center text-sm text-slate-500">© {year} {t.footer}</footer>
    </main>
  );
}
