"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Lang = "zh" | "en";

type CommentItem = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

const copy = {
  zh: {
    status: "开发中",
    menuTitle: "GENERAL",
    nav: ["近期文章", "我的项目", "个人介绍", "推荐分享", "优秀博客"],
    write: "写文章",
    greetings: {
      dawn: "夜深啦",
      morning: "早上好",
      afternoon: "下午好",
      evening: "晚上好"
    },
    latest: "最新文章",
    latestTitle: "建站记录 & 蓝色主题实验",
    latestDesc: "把这个空间做成自己的双语个人 Wiki、博客和项目展示页。",
    project: "我的项目",
    projectTitle: "yzy 天气网页",
    projectDesc: "一个独立的气象网页项目，收藏天气信息与可视化灵感。",
    projectButton: "打开天气网页",
    wikiButton: "查看 GitHub",
    music: "梦幻诛仙 · 张碧晨",
    friends: "友链 / Blogroll",
    interaction: "互动角落",
    like: "喜欢这个小站",
    liked: "已点赞",
    totalLikes: "累计总赞数",
    commentTitle: "留言",
    commentName: "昵称",
    commentText: "写点什么吧...",
    commentButton: "发布留言",
    localHint: "当前版本已去掉 borrowed 初始数字；本地会累计更新。若要所有访客共享总赞数和评论，需要接入免费数据库或评论服务。",
    buttons: ["Github", "Bilibili", "小红书", "Email"],
    footer: "Made with Next.js · yzy-ovo"
  },
  en: {
    status: "Building",
    menuTitle: "GENERAL",
    nav: ["Recent Posts", "Projects", "About Me", "Recommendations", "Blogroll"],
    write: "New Post",
    greetings: {
      dawn: "Late Night",
      morning: "Good Morning",
      afternoon: "Good Afternoon",
      evening: "Good Evening"
    },
    latest: "Latest Post",
    latestTitle: "Website Log & Soft Blue Theme Lab",
    latestDesc: "Building a bilingual personal wiki, blog, and project showcase.",
    project: "My Project",
    projectTitle: "yzy Weather Page",
    projectDesc: "A small weather project for forecasts, meteorology notes, and visual ideas.",
    projectButton: "Open Weather Page",
    wikiButton: "View GitHub",
    music: "Dream Zhu Xian · Diamond Zhang",
    friends: "Blogroll / Links",
    interaction: "Interaction Corner",
    like: "Like this site",
    liked: "Liked",
    totalLikes: "Total likes",
    commentTitle: "Comments",
    commentName: "Name",
    commentText: "Leave a message...",
    commentButton: "Post comment",
    localHint: "No borrowed starting number is used now. This counter updates locally. A shared counter and public comments need a free database or comment service.",
    buttons: ["Github", "Bilibili", "RedNote", "Email"],
    footer: "Made with Next.js · yzy-ovo"
  }
};

const socialLinks = [
  {
    key: "github",
    icon: "/icons/github.svg",
    url: "https://github.com/libai202505-prog"
  },
  {
    key: "bilibili",
    icon: "/icons/bilibili.svg",
    url: "https://space.bilibili.com/382447104"
  },
  {
    key: "rednote",
    icon: "/icons/rednote.svg",
    url: "https://xhslink.com/m/9j81uT8b2VH"
  },
  {
    key: "email",
    icon: "/icons/email.svg",
    url: "mailto:1742521891@qq.com"
  }
];

const navLinks = ["#section-0", "#section-1", "/about", "#section-3", "#section-4"];
const musicUrl = "https://music.163.com/#/song?id=438456232";
const weatherUrl = "https://libai202505-prog.github.io/weather-websites-of-y/";
const githubUrl = "https://github.com/libai202505-prog";
const weatherGithubUrl = "https://github.com/libai202505-prog/weather-websites-of-y";
const initialLikeCount = 0;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getGreeting(now: Date | null, lang: Lang) {
  const hour = now?.getHours() ?? 9;
  const greetings = copy[lang].greetings;
  if (hour >= 5 && hour < 12) return greetings.morning;
  if (hour >= 12 && hour < 18) return greetings.afternoon;
  if (hour >= 18 && hour < 24) return greetings.evening;
  return greetings.dawn;
}

function MiniCalendar({ now, lang }: { now: Date | null; lang: Lang }) {
  const base = now ?? new Date();
  const year = base.getFullYear();
  const month = base.getMonth();
  const today = base.getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const weekday = ["日", "一", "二", "三", "四", "五", "六"];
  const weekdayEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const blanks = Array.from({ length: firstDay }, (_, index) => `blank-${index}`);
  const days = Array.from({ length: totalDays }, (_, index) => index + 1);

  return (
    <div className="calendar-card widget-card">
      <div className="mb-5 flex items-center justify-between text-sm text-slate-500">
        <span>{lang === "zh" ? `${year}/${month + 1}/${today}` : `${month + 1}/${today}/${year}`}</span>
        <span>{lang === "zh" ? `周${weekday[base.getDay()]}` : weekdayEn[base.getDay()]}</span>
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

function InteractionCard({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [comments, setComments] = useState<CommentItem[]>([]);

  useEffect(() => {
    const savedLikes = window.localStorage.getItem("yzy-ovo-like-count");
    const savedLiked = window.localStorage.getItem("yzy-ovo-liked") === "true";
    const savedComments = window.localStorage.getItem("yzy-ovo-comments");

    if (savedLikes) setLikeCount(Number(savedLikes));
    setLiked(savedLiked);
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments) as CommentItem[]);
      } catch {
        setComments([]);
      }
    }
  }, []);

  function handleLike() {
    if (liked) return;
    const next = likeCount + 1;
    setLiked(true);
    setLikeCount(next);
    window.localStorage.setItem("yzy-ovo-liked", "true");
    window.localStorage.setItem("yzy-ovo-like-count", String(next));
  }

  function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;

    const nextComment: CommentItem = {
      id: `${Date.now()}`,
      name: name.trim() || "yzy guest",
      text: cleanText,
      createdAt: new Date().toLocaleString(lang === "zh" ? "zh-CN" : "en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    const nextComments = [nextComment, ...comments].slice(0, 5);
    setComments(nextComments);
    setText("");
    window.localStorage.setItem("yzy-ovo-comments", JSON.stringify(nextComments));
  }

  return (
    <article className="interaction-card glass-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-500">Like & Comment</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-700">{t.interaction}</h2>
        </div>
        <button type="button" onClick={handleLike} className={liked ? "like-button liked" : "like-button"}>
          <span>{liked ? "♥" : "♡"}</span>
          {liked ? t.liked : t.like}
        </button>
      </div>

      <div className="mt-4 rounded-3xl bg-white/50 p-4 text-sm text-slate-500">
        {t.totalLikes}: <span className="font-semibold text-cyan-600">{likeCount.toLocaleString()}</span>
      </div>

      <form onSubmit={handleComment} className="mt-5 space-y-3">
        <input value={name} onChange={(event) => setName(event.target.value)} className="comment-input" placeholder={t.commentName} />
        <textarea value={text} onChange={(event) => setText(event.target.value)} className="comment-input min-h-24 resize-none" placeholder={t.commentText} />
        <button type="submit" className="comment-submit">{t.commentButton}</button>
      </form>

      <div className="mt-5 space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-700">{comment.name}</span>
              <span className="text-xs text-slate-400">{comment.createdAt}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">{comment.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-400">{t.localHint}</p>
    </article>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  const [now, setNow] = useState<Date | null>(null);
  const t = copy[lang];
  const greeting = getGreeting(now, lang);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000 * 30);
    return () => window.clearInterval(timer);
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="min-h-screen overflow-hidden px-4 py-6 text-slate-700 sm:px-6 lg:px-10">
      <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="language-button top-language-button">
        {lang === "zh" ? "English" : "中文"}
      </button>

      <div className="site-shell mx-auto grid max-w-7xl gap-6 lg:grid-cols-[310px_minmax(420px,1fr)_390px]">
        <aside className="sidebar glass-panel p-7 lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] lg:overflow-y-auto">
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
              <a key={item} href={navLinks[index]} className={index === 3 ? "nav-pill is-active" : "nav-pill"}>
                <span className="nav-icon">{["▤", "◇", "○", "★", "◎"][index]}</span>
                <span>{item}</span>
              </a>
            ))}
          </nav>

          <article id="section-0" className="latest-card mt-8 rounded-[2rem] border border-white/70 bg-white/45 p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.latest}</p>
            <a href="/about" className="latest-row mt-4">
              <Image src="/avatar.webp" alt="latest post" width={58} height={58} className="latest-thumb rounded-2xl object-cover" />
              <div className="latest-copy min-w-0">
                <h2 className="latest-title">{t.latestTitle}</h2>
                <p className="latest-desc">{t.latestDesc}</p>
              </div>
            </a>
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
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-700">{greeting}</h2>
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
              <a href="/about" className="about-entry-link mt-6 inline-flex">
                {lang === "zh" ? "进入个人介绍" : "Read About Me"}
              </a>
            </article>

            <article id="section-1" className="project-card glass-panel flex flex-col justify-between p-7">
              <div>
                <p className="text-sm text-slate-500">{t.project}</p>
                <h3 className="mt-5 text-2xl font-semibold text-slate-700">{t.projectTitle}</h3>
                <p className="mt-3 leading-7 text-slate-500">{t.projectDesc}</p>
              </div>
              <div className="mt-7 grid gap-3">
                <a href={weatherUrl} target="_blank" rel="noreferrer" className="project-link primary">
                  <span>☁</span>
                  {t.projectButton}
                </a>
                <a href={weatherGithubUrl} target="_blank" rel="noreferrer" className="project-link">
                  <span>⌘</span>
                  {t.wikiButton}
                </a>
              </div>
            </article>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {socialLinks.map((link, index) => (
              <a
                key={link.key}
                href={link.url}
                target={link.key === "email" ? undefined : "_blank"}
                rel={link.key === "email" ? undefined : "noreferrer"}
                className={link.key === "github" ? "social-button social-dark" : "social-button"}
              >
                <img src={link.icon} alt="" className="social-icon-img" />
                {t.buttons[index]}
              </a>
            ))}
          </div>

          <InteractionCard lang={lang} />
        </section>

        <aside className="right-column space-y-6">
          <div className="flex items-center gap-5 pr-28 lg:pr-0">
            <a href="/about" className="write-button">
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
            <a className="play-button" aria-label="play music" href={musicUrl} target="_blank" rel="noreferrer">▶</a>
          </article>

          <article id="section-4" className="friends-card glass-panel p-6">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-500">Friends</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-700">{t.friends}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <a href={weatherUrl} target="_blank" rel="noreferrer" className="friend-pill">Weather</a>
              <a href={weatherGithubUrl} target="_blank" rel="noreferrer" className="friend-pill">GitHub</a>
              <a href="https://space.bilibili.com/382447104" target="_blank" rel="noreferrer" className="friend-pill">Bilibili</a>
              <a href="https://xhslink.com/m/9j81uT8b2VH" target="_blank" rel="noreferrer" className="friend-pill">RedNote</a>
            </div>
          </article>
        </aside>
      </div>

      <footer className="mx-auto mt-8 max-w-7xl pb-4 text-center text-sm text-slate-500">© {year} {t.footer}</footer>
    </main>
  );
}
