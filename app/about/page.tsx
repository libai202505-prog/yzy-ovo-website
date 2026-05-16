"use client";

import Image from "next/image";
import Link from "next/link";
import SiteNav from "../../components/SiteNav";
import { useState } from "react";

type Lang = "zh" | "en";

const aboutCopy = {
  zh: {
    switchText: "English",
    title: "YZY-OVO",
    subtitle: "",
    introTitle: "Hi! ✨ I'm yzy",
    bullets: [
      "南方人，INFP-T，在读研究生。",
      "喜欢把生活碎片、学习笔记、作品和灵感慢慢收集起来。",
      "这个网站会记录我的日常观察、网页实验、项目进展和一些喜欢的东西。",
      "希望这里能慢慢变成一个温柔、清爽、有秩序的小角落。",
      "如果你对我正在做的东西感兴趣，欢迎来 GitHub 或其他社交平台找我。"
    ],
    quoteA: "记录不是为了把生活变得完美，而是为了看见自己正在怎样生长。",
    quoteB: "把灵感放进一个小小的空间里，让它们慢慢发光。",
    contact: "关于这个网站的建议、想法或问题，欢迎通过邮箱或社交平台联系我。",
    back: "返回首页",
    github: "GitHub",
    bilibili: "Bilibili",
    rednote: "小红书",
    email: "Email"
  },
  en: {
    switchText: "中文",
    title: "YZY-OVO",
    subtitle: "",
    introTitle: "Hi! ✨ I'm yzy",
    bullets: [
      "From southern China, INFP-T, currently a graduate student.",
      "I collect life fragments, study notes, works, and small sparks of inspiration.",
      "This site is where I keep daily observations, web experiments, project updates, and things I like.",
      "I hope this place slowly becomes a gentle, fresh, and organized personal corner.",
      "If you are interested in what I am building, feel free to find me on GitHub or social platforms."
    ],
    quoteA: "Recording life is not about making it perfect, but about noticing how I am growing.",
    quoteB: "Put inspiration into a tiny space, and let it glow slowly.",
    contact: "For suggestions, ideas, or questions about this website, feel free to reach me by email or social platforms.",
    back: "Back Home",
    github: "GitHub",
    bilibili: "Bilibili",
    rednote: "RedNote",
    email: "Email"
  }
};

const links = [
  ["github", "https://github.com/libai202505-prog"],
  ["bilibili", "https://space.bilibili.com/382447104"],
  ["rednote", "https://xhslink.com/m/9j81uT8b2VH"],
  ["email", "mailto:1742521891@qq.com"]
] as const;

export default function AboutPage() {
  const [lang, setLang] = useState<Lang>("zh");
  const t = aboutCopy[lang];

  return (
    <main className="about-page min-h-screen px-5 pb-12 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav />
      <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="language-button top-language-button">
        {t.switchText}
      </button>

      <section className="about-shell mx-auto max-w-5xl">
        <div className="about-heading text-center">
          <Image src="/avatar.webp" alt="yzy-ovo avatar" width={86} height={86} className="avatar-ring mx-auto rounded-full object-cover" priority />
          <h1 className="mt-5 text-5xl font-black tracking-[0.08em] text-slate-700 sm:text-6xl">{t.title}</h1>
          {t.subtitle ? <p className="mt-4 text-xl tracking-[0.18em] text-slate-400">{t.subtitle}</p> : null}
        </div>

        <article className="about-panel glass-panel mt-14 p-8 sm:p-10 lg:p-12">
          <h2 className="about-intro-title text-4xl font-black tracking-tight text-slate-700">
            <span className="text-cyan-400">#</span> {t.introTitle}
          </h2>

          <ul className="about-list mt-10 space-y-5 text-lg leading-9 text-slate-600">
            {t.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="about-quote mt-8 rounded-3xl border-l-4 border-cyan-300 bg-cyan-50/45 p-6 text-lg leading-9 text-slate-600">
            <p>“{t.quoteA}”</p>
            <p className="mt-5">“{t.quoteB}”</p>
          </div>

          <p className="mt-8 text-lg font-semibold leading-9 text-teal-500">{t.contact}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {links.map(([key, url]) => (
              <a key={key} href={url} target={key === "email" ? undefined : "_blank"} rel={key === "email" ? undefined : "noreferrer"} className="friend-pill">
                {t[key]}
              </a>
            ))}
            <Link href="/" className="friend-pill about-back-link">{t.back}</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
