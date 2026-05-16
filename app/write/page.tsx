"use client";

import SiteNav from "../../components/SiteNav";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Draft = {
  title: string;
  slug: string;
  content: string;
  summary: string;
  tagsText: string;
  category: string;
  publishedAt: string;
  hidden: boolean;
  coverDataUrl: string;
  imageUrls: string[];
};

function getDefaultDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function createDraft(source?: Partial<Draft>): Draft {
  return {
    title: source?.title ?? "",
    slug: source?.slug ?? "",
    content: source?.content ?? "",
    summary: source?.summary ?? "",
    tagsText: source?.tagsText ?? "",
    category: source?.category ?? "uncategorized",
    publishedAt: source?.publishedAt ?? getDefaultDate(),
    hidden: source?.hidden ?? false,
    coverDataUrl: source?.coverDataUrl ?? "",
    imageUrls: source?.imageUrls ?? []
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inlineMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="preview-inline-image" src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToPreview(markdown: string) {
  const lines = escapeHtml(markdown || "还没有内容，先写一点吧。导入 MD 后可以在这里查看真实文章效果。").split("\n");
  return lines
    .map((line) => {
      const content = inlineMarkdown(line);
      if (line.startsWith("### ")) return `<h3>${inlineMarkdown(line.slice(4))}</h3>`;
      if (line.startsWith("## ")) return `<h2>${inlineMarkdown(line.slice(3))}</h2>`;
      if (line.startsWith("# ")) return `<h1>${inlineMarkdown(line.slice(2))}</h1>`;
      if (line.startsWith("> ")) return `<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`;
      if (line.startsWith("- ")) return `<li>${inlineMarkdown(line.slice(2))}</li>`;
      if (!line.trim()) return "<br />";
      return `<p>${content}</p>`;
    })
    .join("");
}

function buildMarkdownFile(draft: Draft) {
  const tags = draft.tagsText
    .split(/[，,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  return `---\ntitle: "${draft.title || "未命名文章"}"\nslug: "${draft.slug || "untitled"}"\nsummary: "${draft.summary}"\ncategory: "${draft.category}"\ntags: [${tags.map((tag) => `"${tag}"`).join(", ")}]\ndate: "${draft.publishedAt}"\nhidden: ${draft.hidden}\n---\n\n${draft.content}`;
}

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

function extractSecretFromText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const candidate = parsed.secret ?? parsed.key ?? parsed.token ?? parsed.password ?? parsed.value;
    if (typeof candidate === "string") return candidate.trim();
  } catch {
    // Plain text key files are supported too.
  }

  const envLine = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#"));

  if (!envLine) return "";
  return envLine.includes("=") ? envLine.split("=").slice(1).join("=").replace(/^['\"]|['\"]$/g, "").trim() : envLine;
}

export default function WritePage() {
  const mdInputRef = useRef<HTMLInputElement>(null);
  const secretInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(() => createDraft());
  const [isPreview, setIsPreview] = useState(false);
  const [secret, setSecret] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [savedText, setSavedText] = useState("草稿会自动保存在当前浏览器");

  useEffect(() => {
    const saved = window.localStorage.getItem("yzy-ovo-write-draft");
    const savedSecret = window.localStorage.getItem("yzy-ovo-write-secret") ?? "";
    if (savedSecret) setSecret(savedSecret);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Draft>;
        setDraft(createDraft(parsed));
      } catch {
        setDraft(createDraft());
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("yzy-ovo-write-draft", JSON.stringify(draft));
  }, [draft]);

  const previewHtml = useMemo(() => markdownToPreview(draft.content), [draft.content]);
  const headings = useMemo(
    () =>
      draft.content
        .split("\n")
        .filter((line) => /^#{1,3}\s+/.test(line))
        .map((line) => line.replace(/^#{1,3}\s+/, "").trim())
        .filter(Boolean)
        .slice(0, 8),
    [draft.content]
  );

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleMarkdownImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      const titleFromFile = file.name.replace(/\.md$/i, "").replace(/[-_]/g, " ");
      setDraft((current) => ({
        ...current,
        title: current.title || titleFromFile,
        slug: current.slug || file.name.replace(/\.md$/i, "").toLowerCase(),
        content
      }));
      setSavedText("已导入 Markdown 文件");
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handleSecretImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imported = extractSecretFromText(String(reader.result ?? ""));
      if (!imported) {
        setSavedText("没有在文件里读到密钥，请检查 txt/json/env 文件内容");
        return;
      }
      setSecret(imported);
      window.localStorage.setItem("yzy-ovo-write-secret", imported);
      setSavedText(`已从 ${file.name} 导入密钥，并保存到当前浏览器`);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handleCoverImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateDraft("coverDataUrl", String(reader.result ?? ""));
      setSavedText("封面已加入草稿预览");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function addImageUrl() {
    const cleanUrl = imageUrl.trim();
    if (!cleanUrl) return;
    setDraft((current) => ({
      ...current,
      imageUrls: Array.from(new Set([...(current.imageUrls ?? []), cleanUrl])).slice(0, 12)
    }));
    setImageUrl("");
    setSavedText("图片链接已加入图片管理");
  }

  function handleImageImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      if (!dataUrl) return;
      setDraft((current) => ({
        ...current,
        imageUrls: [dataUrl, ...(current.imageUrls ?? [])].slice(0, 12)
      }));
      setSavedText("图片已加入图片管理，可插入到 Markdown");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removeManagedImage(url: string) {
    setDraft((current) => ({
      ...current,
      imageUrls: (current.imageUrls ?? []).filter((item) => item !== url)
    }));
    setSavedText("已从图片管理移除");
  }

  function insertManagedImage(url: string) {
    const imageMarkdown = `\n![图片](${url})\n`;
    setDraft((current) => ({ ...current, content: `${current.content}${imageMarkdown}` }));
    setSavedText("已把图片 Markdown 插入正文末尾");
  }

  async function copyMarkdown() {
    const output = buildMarkdownFile(draft);
    await window.navigator.clipboard.writeText(output);
    setSavedText("已复制文章 Markdown，可粘贴到 GitHub 新文章文件里");
  }

  function downloadMarkdown() {
    const output = buildMarkdownFile(draft);
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.slug || "new-post"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSavedText("已下载 Markdown 文件");
  }

  if (isPreview) {
    return (
      <main className="write-preview-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
        <SiteNav showEdit={false} />
        <button type="button" className="floating-edit" onClick={() => setIsPreview(false)}>关闭预览</button>
        <section className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article className="article-preview-card glass-panel">
            {draft.coverDataUrl ? <img src={draft.coverDataUrl} alt="article cover" className="article-preview-cover" /> : null}
            <header className="article-preview-header">
              <p className="sub-kicker">PREVIEW</p>
              <h1>{draft.title || "Untitled"}</h1>
              <p>{formatDate(draft.publishedAt)}</p>
              {draft.summary ? <p className="article-preview-summary">{draft.summary}</p> : null}
            </header>
            <div className="write-preview article-preview-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </article>
          <aside className="preview-side space-y-5">
            <section className="glass-panel preview-mini-card">
              <p className="font-semibold text-slate-600">目录</p>
              {headings.length ? (
                <div className="mt-3 space-y-2 text-sm text-slate-500">
                  {headings.map((heading) => <p key={heading}>{heading}</p>)}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">暂无标题层级</p>
              )}
            </section>
            <section className="glass-panel preview-like-card">
              <span>♡</span>
              <p>预览模式</p>
            </section>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="write-page min-h-screen text-slate-700">
      <SiteNav showEdit={false} />
      <section className="write-hero relative overflow-hidden">
        <img src="/hero-bg.webp" alt="cover background" className="h-full w-full object-cover" />
        <div className="write-hero-fade" />
        <div className="write-actions">
          <input ref={mdInputRef} type="file" accept=".md,.markdown,text/markdown,text/plain" className="hidden" onChange={handleMarkdownImport} />
          <input ref={secretInputRef} type="file" accept=".txt,.json,.env,.key,text/plain,application/json" className="hidden" onChange={handleSecretImport} />
          <button type="button" className="write-tool-button" onClick={() => mdInputRef.current?.click()}>导入 MD</button>
          <button type="button" className="write-tool-button" onClick={() => setIsPreview(true)}>预览</button>
          <button type="button" className="write-tool-button primary" onClick={() => secretInputRef.current?.click()}>导入密钥</button>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1420px] gap-7 px-5 pb-12 lg:grid-cols-[minmax(0,1fr)_390px] xl:px-8">
        <article className="write-editor glass-panel p-6">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_245px]">
            <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} className="write-input text-lg" placeholder="标题" />
            <input value={draft.slug} onChange={(event) => updateDraft("slug", event.target.value)} className="write-input" placeholder="slug（xx-xx）" />
          </div>

          <textarea value={draft.content} onChange={(event) => updateDraft("content", event.target.value)} className="write-textarea mt-4" placeholder="Markdown 内容" />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>{secret ? `${savedText} · 密钥已导入` : savedText}</span>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="write-small-button" onClick={copyMarkdown}>复制 Markdown</button>
              <button type="button" className="write-small-button" onClick={downloadMarkdown}>下载 MD</button>
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <section className="write-side-card glass-panel p-6">
            <p className="mb-4 text-sm font-semibold text-slate-700">封面</p>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImport} />
            <button type="button" className="cover-drop" onClick={() => coverInputRef.current?.click()}>
              {draft.coverDataUrl ? <img src={draft.coverDataUrl} alt="article cover" /> : <span>＋</span>}
            </button>
          </section>

          <section className="write-side-card glass-panel p-6">
            <p className="mb-4 text-sm font-semibold text-slate-700">元信息</p>
            <div className="space-y-3">
              <textarea value={draft.summary} onChange={(event) => updateDraft("summary", event.target.value)} className="write-input min-h-24 resize-none" placeholder="为这篇文章写一段简短摘要" />
              <input value={draft.tagsText} onChange={(event) => updateDraft("tagsText", event.target.value)} className="write-input" placeholder="添加标签（逗号分隔）" />
              <select value={draft.category} onChange={(event) => updateDraft("category", event.target.value)} className="write-input">
                <option value="uncategorized">未分类</option>
                <option value="life">生活碎片</option>
                <option value="study">学习笔记</option>
                <option value="project">作品项目</option>
                <option value="inspiration">灵感收藏</option>
              </select>
              <input type="datetime-local" value={draft.publishedAt} onChange={(event) => updateDraft("publishedAt", event.target.value)} className="write-input" />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={draft.hidden} onChange={(event) => updateDraft("hidden", event.target.checked)} className="h-4 w-4 rounded border-white/80" />
                隐藏此文章（仅管理员可见）
              </label>
            </div>
          </section>

          <section className="write-side-card glass-panel p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">图片管理</p>
              <button type="button" className="image-tool-link" onClick={() => setSavedText("可以先把图片压缩后再上传到 GitHub / 图床，再把链接放进图片管理")}>压缩工具</button>
            </div>
            <div className="image-manager-row">
              <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className="write-input" placeholder="https://..." />
              <button type="button" className="write-small-button compact" onClick={addImageUrl}>添加</button>
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageImport} />
            <button type="button" className="image-add-tile mt-4" onClick={() => imageInputRef.current?.click()}>＋</button>
            {(draft.imageUrls ?? []).length ? (
              <div className="managed-image-grid mt-4">
                {(draft.imageUrls ?? []).map((url) => (
                  <div key={url} className="managed-image-item">
                    <img src={url} alt="managed upload" />
                    <div className="managed-image-actions">
                      <button type="button" onClick={() => insertManagedImage(url)}>插入</button>
                      <button type="button" onClick={() => removeManagedImage(url)}>删除</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </aside>
      </section>
    </main>
  );
}
