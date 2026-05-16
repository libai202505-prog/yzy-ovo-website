export type ProjectItem = {
  id: string;
  title: string;
  year: string;
  tag: string;
  summary: string;
  website: string;
  github: string;
};

export const defaultProjects: ProjectItem[] = [
  {
    id: "weather-yzy",
    title: "yzy 天气网页",
    year: "2026",
    tag: "Weather",
    summary: "独立的气象网页项目，用来收藏天气信息、可视化灵感和页面实验。",
    website: "https://libai202505-prog.github.io/weather-websites-of-y/",
    github: "https://github.com/libai202505-prog/weather-websites-of-y"
  },
  {
    id: "yzy-ovo-site",
    title: "yzy-ovo Website",
    year: "2026",
    tag: "Personal Wiki",
    summary: "浅蓝渐变个人 Wiki，包含文章、项目、关于、推荐、友链和互动角落。",
    website: "/",
    github: "https://github.com/libai202505-prog/yzy-ovo-website"
  }
];

function cleanString(value: unknown, fallback = "", maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

function cleanUrl(value: unknown, fallback = "") {
  const text = cleanString(value, fallback, 1000);
  if (!text) return fallback;
  if (text.startsWith("/") || text.startsWith("https://") || text.startsWith("http://") || text.startsWith("mailto:")) {
    return text;
  }
  return fallback;
}

export function normalizeProjects(value: unknown): ProjectItem[] {
  const source = Array.isArray(value) ? value : defaultProjects;
  const projects = source
    .map((item, index) => {
      const record = typeof item === "object" && item !== null ? (item as Partial<ProjectItem>) : {};
      const fallback = defaultProjects[index] ?? defaultProjects[0];
      const title = cleanString(record.title, fallback.title, 80);
      const id = cleanString(record.id, title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || `project-${index + 1}`, 80);

      return {
        id,
        title,
        year: cleanString(record.year, fallback.year, 20),
        tag: cleanString(record.tag, fallback.tag, 40),
        summary: cleanString(record.summary, fallback.summary, 320),
        website: cleanUrl(record.website, fallback.website),
        github: cleanUrl(record.github, fallback.github)
      };
    })
    .filter((item) => item.title)
    .slice(0, 30);

  return projects.length ? projects : defaultProjects;
}
