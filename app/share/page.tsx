"use client";

import SiteNav from "../../components/SiteNav";
import { useMemo, useState } from "react";

type Resource = {
  title: string;
  url: string;
  desc: string;
  category: string;
  tags: string[];
  icon: string;
  stars: number;
  meta: string;
};

const resources: Resource[] = [
  {
    title: "梦幻诛仙 · 张碧晨",
    url: "https://music.163.com/#/song?id=438456232",
    desc: "很适合做写作和整理灵感时的背景音乐。",
    category: "Music",
    tags: ["收藏", "音乐"],
    icon: "♪",
    stars: 5,
    meta: "网易云音乐"
  },
  {
    title: "yzy weather websites",
    url: "https://libai202505-prog.github.io/weather-websites-of-y/",
    desc: "自己的天气网页项目，适合放在作品和推荐区一起展示。",
    category: "Project",
    tags: ["My Column", "Frontend"],
    icon: "☁",
    stars: 5,
    meta: "个人项目"
  },
  {
    title: "weather-websites-of-y",
    url: "https://github.com/libai202505-prog/weather-websites-of-y",
    desc: "天气网页项目的 GitHub 仓库，方便别人查看源码。",
    category: "GitHub",
    tags: ["My Column", "Open Source"],
    icon: "GH",
    stars: 5,
    meta: "Repository"
  },
  {
    title: "Bilibili 主页",
    url: "https://space.bilibili.com/382447104",
    desc: "视频、收藏和个人动态可以放在这里作为社交入口。",
    category: "Social",
    tags: ["Bilibili", "Life"],
    icon: "B",
    stars: 4,
    meta: "社交媒体"
  },
  {
    title: "小红书主页",
    url: "https://xhslink.com/m/9j81uT8b2VH",
    desc: "适合放生活碎片、日常记录和灵感收藏。",
    category: "Social",
    tags: ["小红书", "Life"],
    icon: "红",
    stars: 4,
    meta: "社交媒体"
  },
  {
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org/",
    desc: "查 HTML、CSS、JavaScript 很稳，适合前端学习。",
    category: "Frontend",
    tags: ["Learning", "Frontend"],
    icon: "MDN",
    stars: 5,
    meta: "Web 文档"
  },
  {
    title: "Next.js Docs",
    url: "https://nextjs.org/docs",
    desc: "你这个个人站用的是 Next.js，之后改页面可以常查。",
    category: "Frontend",
    tags: ["Next.js", "Learning"],
    icon: "N",
    stars: 5,
    meta: "官方文档"
  },
  {
    title: "Tailwind CSS Docs",
    url: "https://tailwindcss.com/docs",
    desc: "用来微调玻璃拟态、渐变背景、卡片和按钮样式。",
    category: "Tools/Methods",
    tags: ["CSS", "Frontend"],
    icon: "TW",
    stars: 5,
    meta: "样式工具"
  }
];

const categories = ["全部", "My Column", "Music", "Project", "GitHub", "Social", "Frontend", "Tools/Methods", "Learning"];

function starText(count: number) {
  return "★".repeat(count) + "☆".repeat(Math.max(0, 5 - count));
}

export default function SharePage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("全部");
  const [picked, setPicked] = useState<Resource | null>(null);

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return resources.filter((item) => {
      const matchesCategory = active === "全部" || item.category === active || item.tags.includes(active);
      const matchesQuery = !lower || [item.title, item.desc, item.category, ...item.tags].join(" ").toLowerCase().includes(lower);
      return matchesCategory && matchesQuery;
    });
  }, [query, active]);

  function pickRandom() {
    const pool = filtered.length ? filtered : resources;
    const index = Math.floor(Math.random() * pool.length);
    setPicked(pool[index]);
  }

  return (
    <main className="sub-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav />
      <section className="mx-auto max-w-7xl">
        <div className="sub-heading">
          <p className="sub-kicker">RANDOM PICKS</p>
          <h1>推荐分享</h1>
          <p>把常用工具、学习资料、社交入口和自己的项目都收进来。可以搜索、按分类筛选，也可以随机抽一个。</p>
        </div>

        <div className="resource-controls mx-auto mt-10">
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="resource-search" placeholder="搜索资源..." />
          <button type="button" className="resource-random-button" onClick={pickRandom}>随机推荐</button>
        </div>

        <div className="resource-tags mt-5">
          {categories.map((category) => (
            <button key={category} type="button" className={active === category ? "resource-tag active" : "resource-tag"} onClick={() => setActive(category)}>
              {category}
            </button>
          ))}
        </div>

        {picked ? (
          <a href={picked.url} target="_blank" rel="noreferrer" className="random-picked glass-panel">
            <span>今日随机</span>
            <strong>{picked.title}</strong>
            <p>{picked.desc}</p>
          </a>
        ) : null}

        <div className="resource-grid mt-10">
          {filtered.map((item) => (
            <a key={item.title} href={item.url} target="_blank" rel="noreferrer" className="resource-card glass-panel">
              <div className="resource-card-top">
                <div className="resource-icon">{item.icon}</div>
                <div>
                  <h2>{item.title}</h2>
                  <p className="resource-url">{item.url.replace(/^https?:\/\//, "").slice(0, 34)}...</p>
                </div>
              </div>
              <p className="resource-stars">{starText(item.stars)}</p>
              <div className="resource-chip-row">
                {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <p className="resource-desc">{item.desc}</p>
              <p className="resource-meta">{item.meta}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
