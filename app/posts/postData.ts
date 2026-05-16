export type PostItem = {
  id: string;
  title: string;
  date: string;
  tag: string;
  href: string;
  read?: boolean;
  category?: string;
};

export const defaultCategories = ["代码实现", "总结", "开源"];

export const defaultPosts: PostItem[] = [
  { id: "site-log", title: "建站记录 & 蓝色主题实验", date: "2026-05-16", tag: "Website", href: "/posts/site-log", read: true, category: "开源" },
  { id: "weather-page", title: "天气网页项目整理", date: "2026-05-12", tag: "Project", href: "/projects", category: "总结" },
  { id: "markdown-workflow", title: "Markdown 写作工作流", date: "2026-04-22", tag: "Notes", href: "/write", category: "总结" },
  { id: "wiki-structure", title: "个人 Wiki 页面结构记录", date: "2026-04-19", tag: "Website", href: "/about", category: "开源" },
  { id: "life-fragments", title: "生活碎片收藏夹", date: "2026-03-16", tag: "Life", href: "/write", read: true, category: "总结" },
  { id: "frontend-card-lab", title: "前端卡片排版实验", date: "2026-03-04", tag: "Frontend", href: "/write", category: "代码实现" },
  { id: "public-comments", title: "公开留言与点赞后端", date: "2026-02-04", tag: "Backend", href: "/write", category: "代码实现" },
  { id: "study-archive", title: "学习资料归档计划", date: "2025-12-02", tag: "Study", href: "/share", category: "总结" },
  { id: "articles-merge", title: "我的十多篇文章整合", date: "2025-07-18", tag: "Summary", href: "/write", category: "总结" },
  { id: "deepseek-notes", title: "DeepSeek 模型能力笔记", date: "2025-02-14", tag: "AI", href: "/write", category: "总结" },
  { id: "cpp-share", title: "C++ 学习分享", date: "2024-12-28", tag: "Programming", href: "/write", category: "代码实现" },
  { id: "vae-flow", title: "从 VAE 到 Flow Matching", date: "2024-03-28", tag: "GenerativeAI", href: "/write", category: "总结" },
  { id: "llm-warm-water", title: "LLM 的温水煮青蛙", date: "2023-12-18", tag: "LLM", href: "/write", category: "总结" },
  { id: "llm-papers", title: "LLM 核心论文 23 篇", date: "2023-11-07", tag: "AI", href: "/write", category: "总结" }
];

function cleanString(value: unknown, fallback = "") {
  const text = String(value ?? "").replace(/[<>]/g, "").trim();
  return text || fallback;
}

export function normalizePosts(value: unknown): PostItem[] {
  if (!Array.isArray(value)) return defaultPosts;

  const normalized = value
    .map((item, index): PostItem | null => {
      if (typeof item !== "object" || item === null) return null;
      const source = item as Partial<PostItem>;
      const title = cleanString(source.title);
      if (!title) return null;
      const id = cleanString(source.id, `post-${Date.now().toString(36)}-${index}`);
      const date = /^\d{4}-\d{2}-\d{2}$/.test(String(source.date ?? "")) ? String(source.date) : new Date().toISOString().slice(0, 10);
      const tag = cleanString(source.tag, "Notes");
      const href = cleanString(source.href, "/write");
      const category = cleanString(source.category, "未分类");
      return { id, title, date, tag, href, category, read: Boolean(source.read) };
    })
    .filter((item): item is PostItem => item !== null);

  return normalized.length ? normalized : defaultPosts;
}

export function normalizeCategories(value: unknown, posts: PostItem[] = defaultPosts): string[] {
  const fromInput = Array.isArray(value)
    ? value.map((item) => cleanString(item)).filter(Boolean)
    : [];
  const fromPosts = posts.map((post) => cleanString(post.category)).filter(Boolean);
  const merged = [...fromInput, ...fromPosts, "未分类"];
  return Array.from(new Set(merged));
}
