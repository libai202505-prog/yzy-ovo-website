export type Lang = "zh" | "en";

export type AboutLangContent = {
  title: string;
  subtitle: string;
  introTitle: string;
  bullets: string[];
  quoteA: string;
  quoteB: string;
  contact: string;
};

export type AboutContent = Record<Lang, AboutLangContent>;

export const defaultAboutContent: AboutContent = {
  zh: {
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
    contact: "关于这个网站的建议、想法或问题，欢迎通过邮箱或社交平台联系我。"
  },
  en: {
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
    contact: "For suggestions, ideas, or questions about this website, feel free to reach me by email or social platforms."
  }
};

function cleanString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.slice(0, 600) : fallback;
}

function cleanBullets(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const bullets = value
    .map((item) => cleanString(item).trim())
    .filter(Boolean)
    .slice(0, 12);
  return bullets.length ? bullets : fallback;
}

export function normalizeAboutContent(value: unknown): AboutContent {
  const source = typeof value === "object" && value !== null ? (value as Partial<AboutContent>) : {};

  return {
    zh: {
      title: cleanString(source.zh?.title, defaultAboutContent.zh.title),
      subtitle: cleanString(source.zh?.subtitle, defaultAboutContent.zh.subtitle),
      introTitle: cleanString(source.zh?.introTitle, defaultAboutContent.zh.introTitle),
      bullets: cleanBullets(source.zh?.bullets, defaultAboutContent.zh.bullets),
      quoteA: cleanString(source.zh?.quoteA, defaultAboutContent.zh.quoteA),
      quoteB: cleanString(source.zh?.quoteB, defaultAboutContent.zh.quoteB),
      contact: cleanString(source.zh?.contact, defaultAboutContent.zh.contact)
    },
    en: {
      title: cleanString(source.en?.title, defaultAboutContent.en.title),
      subtitle: cleanString(source.en?.subtitle, defaultAboutContent.en.subtitle),
      introTitle: cleanString(source.en?.introTitle, defaultAboutContent.en.introTitle),
      bullets: cleanBullets(source.en?.bullets, defaultAboutContent.en.bullets),
      quoteA: cleanString(source.en?.quoteA, defaultAboutContent.en.quoteA),
      quoteB: cleanString(source.en?.quoteB, defaultAboutContent.en.quoteB),
      contact: cleanString(source.en?.contact, defaultAboutContent.en.contact)
    }
  };
}
