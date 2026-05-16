"use client";

import Link from "next/link";
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
};

const defaultDraft: Draft = {
  title: "",
  slug: "",
  content: "",
  summary: "",
  tagsText: "",
  category: "uncategorized",
  publishedAt: "",
  hidden: false,
  coverDataUrl: ""
};

function getDefaultDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function markdownToPreview(markdown: string) {
  const lines = escapeHtml(markdown || "还没有内容，先写一点吧。").split("\n");
  return lines
    .map((line) => {
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
      if (!line.trim()) return "<br />";
      return `<p>${line}</p>`;
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

export default function WritePage() {
  const mdInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>({ ...defaultDraft, publishedAt: getDefaultDate() });
  const [isPreview, setIsPreview] = useState(false);
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [savedText, setSavedText] = useState("草稿会自动保存在当前浏览器");

  useEffect(() => {
    const saved = window.localStorage.getItem("yzy-ovo-write-draft");
    const savedSecret = window.localStorage.getItem("yzy-ovo-write-secret") ?? "";
    if (savedSecret) setSecret(savedSecret);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Draft>;
        setDraft({ ...defaultDraft, ...parsed, publishedAt: parsed.publishedAt ?? getDefaultDate() });
      } catch {
        setDraft({ ...defaultDraft, publishedAt: getDefaultDate() });
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("yzy-ovo-write-draft", JSON.stringify(draft));
  }, [draft]);

  const previewHtml = useMemo(() => markdownToPreview(draft.content), [draft.content]);

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

  async function saveSecret() {
    window.localStorage.setItem("yzy-ovo-write-secret", secret.trim());
    setSavedText(secret.trim() ? "密钥已保存在当前浏览器" : "已清空本地密钥");
    setShowSecret(false);
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

  return (
    <main className="write-page min-h-screen text-slate-700">
      <SiteNav showEdit={false} />
      <section className="write-hero relative overflow-hidden">
        <img src="/hero-bg.webp" alt="cover background" className="h-full w-full object-cover" />
        <div className="write-hero-fade" />
        <Link href="/" className="write-home-avatar" aria-label="back home">
          <img src="/avatar.webp" alt="yzy-ovo avatar" />
        </Link>
        <div className="write-actions">
          <input ref={mdInputRef} type="file" accept=".md,.markdown,text/markdown,text/plain" className="hidden" onChange={handleMarkdownImport} />
          <button type="button" className="write-tool-button" onClick={() => mdInputRef.current?.click()}>导入 MD</button>
          <button type="button" className="write-tool-button" onClick={() => setIsPreview((value) => !value)}>{isPreview ? "继续编辑" : "预览"}</button>
          <button type="button" className="write-tool-button primary" onClick={() => setShowSecret((value) => !value)}>导入密钥</button>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1420px] gap-7 px-5 pb-12 lg:grid-cols-[minmax(0,1fr)_390px] xl:px-8">
        <article className="write-editor glass-panel p-6">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_245px]">
            <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} className="write-input text-lg" placeholder="标题" />
            <input value={draft.slug} onChange={(event) => updateDraft("slug", event.target.value)} className="write-input" placeholder="slug（xx-xx）" />
          </div>

          {isPreview ? (
            <div className="write-preview mt-4 min-h-[520px]" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <textarea value={draft.content} onChange={(event) => updateDraft("content", event.target.value)} className="write-textarea mt-4" placeholder="Markdown 内容" />
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>{savedText}</span>
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

          {showSecret ? (
            <section className="write-side-card glass-panel p-6">
              <p className="mb-3 text-sm font-semibold text-slate-700">本地编辑密钥</p>
              <input value={secret} onChange={(event) => setSecret(event.target.value)} className="write-input" placeholder="粘贴你的密钥" type="password" />
              <button type="button" className="write-small-button mt-3 w-full" onClick={saveSecret}>保存到当前浏览器</button>
              <p className="mt-3 text-xs leading-5 text-slate-400">这里只是保存到你的浏览器，不会上传到 GitHub。真正发布文章仍需要把 MD 文件提交到仓库。</p>
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
