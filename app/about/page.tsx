"use client";

import Image from "next/image";
import Link from "next/link";
import SiteNav from "../../components/SiteNav";
import { useEffect, useState } from "react";
import { AboutContent, Lang, defaultAboutContent, normalizeAboutContent } from "./aboutData";

const staticCopy = {
  zh: {
    switchText: "English",
    back: "返回首页",
    github: "GitHub",
    bilibili: "Bilibili",
    rednote: "小红书",
    email: "Email"
  },
  en: {
    switchText: "中文",
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
  const [content, setContent] = useState<AboutContent>(defaultAboutContent);
  const t = staticCopy[lang];
  const about = content[lang];

  useEffect(() => {
    let active = true;
    fetch("/api/about", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setContent(normalizeAboutContent(data.content));
      })
      .catch(() => {
        if (active) setContent(defaultAboutContent);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="about-page min-h-screen px-5 pb-12 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav />
      <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="language-button top-language-button">
        {t.switchText}
      </button>

      <section className="about-shell mx-auto max-w-5xl">
        <div className="about-heading text-center">
          <Image src="/avatar.webp" alt="yzy-ovo avatar" width={86} height={86} className="avatar-ring mx-auto rounded-full object-cover" priority />
          <h1 className="mt-5 text-5xl font-black tracking-[0.08em] text-slate-700 sm:text-6xl">{about.title}</h1>
          {about.subtitle ? <p className="mt-4 text-xl tracking-[0.18em] text-slate-400">{about.subtitle}</p> : null}
        </div>

        <article className="about-panel glass-panel mt-14 p-8 sm:p-10 lg:p-12">
          <h2 className="about-intro-title text-4xl font-black tracking-tight text-slate-700">
            <span className="text-cyan-400">#</span> {about.introTitle}
          </h2>

          <ul className="about-list mt-10 space-y-5 text-lg leading-9 text-slate-600">
            {about.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="about-quote mt-8 rounded-3xl border-l-4 border-cyan-300 bg-cyan-50/45 p-6 text-lg leading-9 text-slate-600">
            <p>“{about.quoteA}”</p>
            <p className="mt-5">“{about.quoteB}”</p>
          </div>

          <p className="mt-8 text-lg font-semibold leading-9 text-teal-500">{about.contact}</p>

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
