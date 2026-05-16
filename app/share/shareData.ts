export type ResourceItem = {
  id: string;
  title: string;
  url: string;
  desc: string;
  category: string;
  tags: string[];
  icon: string;
  stars: number;
  meta: string;
};

export const defaultResources: ResourceItem[] = [
  {
    id: "music-dream-zhu-xian",
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
    id: "weather-site",
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
    id: "weather-repo",
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
    id: "bilibili-home",
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
    id: "rednote-home",
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
    id: "mdn-web-docs",
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
    id: "next-docs",
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
    id: "tailwind-docs",
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

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readTags(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean).slice(0, 8);
  }

  if (typeof value === "string") {
    return value
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  return fallback;
}

function readStars(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(5, Math.round(numeric)));
}

export function normalizeResources(source: unknown): ResourceItem[] {
  if (!Array.isArray(source)) return defaultResources;

  const normalized = source
    .map((item, index): ResourceItem | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Partial<ResourceItem>;
      const title = readString(record.title, `资源 ${index + 1}`);
      const id = readString(record.id, title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || `resource-${index + 1}`);
      return {
        id,
        title,
        url: readString(record.url, "#"),
        desc: readString(record.desc, "写一段资源说明。"),
        category: readString(record.category, "未分类"),
        tags: readTags(record.tags, []),
        icon: readString(record.icon, "★"),
        stars: readStars(record.stars, 5),
        meta: readString(record.meta, "资源")
      };
    })
    .filter((item): item is ResourceItem => Boolean(item));

  return normalized.length ? normalized : defaultResources;
}

export function getResourceCategories(resources: ResourceItem[]) {
  return ["全部", ...Array.from(new Set(resources.flatMap((item) => [item.category, ...item.tags]).filter(Boolean)))];
}
