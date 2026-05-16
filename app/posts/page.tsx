"use client";

import Link from "next/link";
import SiteNav from "../../components/SiteNav";
import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { PostItem, defaultCategories, defaultPosts, normalizeCategories, normalizePosts } from "./postData";

const tabs = ["日", "周", "月", "年", "分类"] as const;
type Tab = (typeof tabs)[number];

function extractSecretFromText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const candidate = parsed.ADMIN_SECRET ?? parsed.adminSecret ?? parsed.secret ?? parsed.key ?? parsed.token ?? parsed.value;
    if (typeof candidate === "string") return candidate.trim();
  } catch {
    // Plain text and .env style key files are supported too.
  }

  const line = trimmed
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith("#"));

  if (!line) return "";
  return line.includes("=") ? line.split("=").slice(1).join("=").replace(/^[\"']|[\"']$/g, "").trim() : line;
}

function formatMonthDay(date: string) {
  const [, month, day] = date.split("-");
  return `${month}-${day}`;
}

function groupByYear(items: PostItem[]) {
  return items.reduce<Record<string, PostItem[]>>((groups, item) => {
    const year = item.date.slice(0, 4);
    groups[year] = [...(groups[year] ?? []), item];
    return groups;
  }, {});
}

function groupByMonth(items: PostItem[]) {
  return items.reduce<Record<string, PostItem[]>>((groups, item) => {
    const month = item.date.slice(0, 7);
    groups[month] = [...(groups[month] ?? []), item];
    return groups;
  }, {});
}

function groupByTag(items: PostItem[]) {
  return items.reduce<Record<string, PostItem[]>>((groups, item) => {
    groups[item.tag] = [...(groups[item.tag] ?? []), item];
    return groups;
  }, {});
}

function groupByCategory(items: PostItem[]) {
  return items.reduce<Record<string, PostItem[]>>((groups, item) => {
    const category = item.category || "未分类";
    groups[category] = [...(groups[category] ?? []), item];
    return groups;
  }, {});
}

function makePost(): PostItem {
  const stamp = Date.now().toString(36);
  return {
    id: `post-${stamp}`,
    title: "新的文章",
    date: new Date().toISOString().slice(0, 10),
    tag: "Notes",
    href: "/write",
    category: "未分类"
  };
}

function RevealBlock({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`scroll-reveal ${visible ? "visible" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function PostsPage() {
  const secretInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("年");
  const [showAll, setShowAll] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>(defaultPosts);
  const [drafts, setDrafts] = useState<PostItem[]>(defaultPosts);
  const [categories, setCategories] = useState<string[]>(normalizeCategories(defaultCategories, defaultPosts));
  const [draftCategories, setDraftCategories] = useState<string[]>(normalizeCategories(defaultCategories, defaultPosts));
  const [secret, setSecret] = useState("");
  const [manageMode, setManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [status, setStatus] = useState("点击右上角编辑后，可以分类、选择、删除文章；保存到线上前需要导入管理员密钥。");

  useEffect(() => {
    const savedSecret = window.localStorage.getItem("yzy-ovo-admin-secret") ?? "";
    if (savedSecret) setSecret(savedSecret);

    fetch("/api/posts", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const nextPosts = normalizePosts(data.posts);
        const nextCategories = normalizeCategories(data.categories, nextPosts);
        setPosts(nextPosts);
        setDrafts(nextPosts);
        setCategories(nextCategories);
        setDraftCategories(nextCategories);
      })
      .catch(() => {
        setPosts(defaultPosts);
        setDrafts(defaultPosts);
        setCategories(normalizeCategories(defaultCategories, defaultPosts));
        setDraftCategories(normalizeCategories(defaultCategories, defaultPosts));
      });
  }, []);

  const visiblePosts = manageMode ? drafts : posts;

  const groups = useMemo(() => {
    const sourcePosts = [...visiblePosts].sort((a, b) => b.date.localeCompare(a.date));
    if (activeTab === "分类") {
      const byCategory = groupByCategory(sourcePosts);
      return Object.entries(byCategory).map(([label, items]) => ({ label, items }));
    }
    if (activeTab === "月") {
      const byMonth = groupByMonth(sourcePosts);
      return Object.entries(byMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([label, items]) => ({ label, items }));
    }
    if (activeTab === "日") {
      return [{ label: "最近更新", items: sourcePosts.slice(0, 8) }];
    }
    if (activeTab === "周") {
      return [
        { label: "本周附近", items: sourcePosts.slice(0, 4) },
        { label: "更早一些", items: sourcePosts.slice(4, 10) }
      ];
    }
    const byYear = groupByYear(sourcePosts);
    return Object.entries(byYear)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([label, items]) => ({ label, items }));
  }, [activeTab, visiblePosts]);

  const visibleGroups = showAll ? groups : groups.slice(0, 3);
  const allSelected = visiblePosts.length > 0 && selectedIds.length === visiblePosts.length;

  function enterManageMode() {
    setDrafts(posts);
    setDraftCategories(categories);
    setSelectedIds([]);
    setManageMode(true);
    setCategoryPanelOpen(false);
    setStatus(secret ? "已导入密钥，可以分类、选择和删除文章。" : "编辑模式已打开。请导入管理员密钥文件后再保存到线上。");
  }

  function cancelManageMode() {
    setDrafts(posts);
    setDraftCategories(categories);
    setSelectedIds([]);
    setManageMode(false);
    setCategoryPanelOpen(false);
    setStatus("已取消未保存的文章修改。");
  }

  function handleSecretImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = extractSecretFromText(String(reader.result ?? ""));
      if (!imported) {
        setStatus("没有在文件里读到密钥，请检查 txt/json/env 文件内容。");
        return;
      }
      setSecret(imported);
      window.localStorage.setItem("yzy-ovo-admin-secret", imported);
      setStatus(`已导入密钥文件：${file.name}。现在可以保存文章分类和删除操作。`);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function toggleSelected(id: string) {
    setSelectedIds((old) => (old.includes(id) ? old.filter((item) => item !== id) : [...old, id]));
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : visiblePosts.map((post) => post.id));
  }

  function selectGroup(items: PostItem[]) {
    const ids = items.map((post) => post.id);
    setSelectedIds((old) => {
      const hasAll = ids.every((id) => old.includes(id));
      return hasAll ? old.filter((id) => !ids.includes(id)) : Array.from(new Set([...old, ...ids]));
    });
  }

  function updatePost(id: string, patch: Partial<PostItem>) {
    setDrafts((old) => old.map((post) => (post.id === id ? { ...post, ...patch } : post)));
  }

  function addPost() {
    const next = makePost();
    setDrafts((old) => [next, ...old]);
    setSelectedIds([next.id]);
    setCategoryPanelOpen(true);
    setStatus("已添加一篇文章草稿，可以在分类面板中修改分类后保存到线上。");
  }

  function addCategory() {
    const name = newCategory.trim();
    if (!name) return;
    if (!secret.trim()) {
      setStatus("新增分类前，请先导入管理员密钥文件。");
      return;
    }
    if (draftCategories.includes(name)) {
      setStatus("这个分类已经存在。");
      setNewCategory("");
      return;
    }
    const nextCategories = [...draftCategories, name];
    setDraftCategories(nextCategories);
    setNewCategory("");
    void saveOnline({ categoriesToSave: nextCategories, message: `已新增分类「${name}」并保存到线上。` });
  }

  function removeCategory(name: string) {
    if (!secret.trim()) {
      setStatus("删除分类前，请先导入管理员密钥文件。");
      return;
    }
    const nextCategories = draftCategories.filter((category) => category !== name);
    const nextPosts = drafts.map((post) => (post.category === name ? { ...post, category: "未分类" } : post));
    setDraftCategories(nextCategories);
    setDrafts(nextPosts);
    void saveOnline({ postsToSave: nextPosts, categoriesToSave: nextCategories, message: `已删除分类「${name}」，相关文章已移到未分类。` });
  }

  function changePostCategory(id: string, category: string) {
    const nextPosts = drafts.map((post) => (post.id === id ? { ...post, category } : post));
    setDrafts(nextPosts);
    if (secret.trim()) {
      void saveOnline({ postsToSave: nextPosts, message: "已更新文章分类并保存到线上。" });
    } else {
      setStatus("已在本地修改分类；导入密钥后再次修改即可保存到线上。");
    }
  }

  function deleteSelected() {
    if (!selectedIds.length) return;
    if (!secret.trim()) {
      setStatus("删除文章前，请先导入管理员密钥文件。");
      return;
    }
    const nextPosts = drafts.filter((post) => !selectedIds.includes(post.id));
    setDrafts(nextPosts);
    setSelectedIds([]);
    void saveOnline({ postsToSave: nextPosts, message: `已删除 ${selectedIds.length} 篇文章并保存到线上。` });
  }

  async function saveOnline(options?: { postsToSave?: PostItem[]; categoriesToSave?: string[]; message?: string }) {
    const key = secret.trim();
    if (!key) {
      setStatus("请先导入管理员密钥文件。");
      return;
    }

    const postsToSave = options?.postsToSave ?? drafts;
    const categoriesToSave = normalizeCategories(options?.categoriesToSave ?? draftCategories, postsToSave);
    setStatus("正在保存文章设置到线上...");
    const response = await fetch("/api/posts", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-yzy-admin-secret": key
      },
      body: JSON.stringify({ posts: postsToSave, categories: categoriesToSave })
    });

    const data = (await response.json()) as { posts?: PostItem[]; categories?: string[]; error?: string };
    if (!response.ok) {
      setStatus(data.error ?? "保存失败，请检查 Upstash 和 ADMIN_SECRET 环境变量。");
      return;
    }

    const savedPosts = normalizePosts(data.posts ?? postsToSave);
    const savedCategories = normalizeCategories(data.categories ?? categoriesToSave, savedPosts);
    setPosts(savedPosts);
    setDrafts(savedPosts);
    setCategories(savedCategories);
    setDraftCategories(savedCategories);
    setStatus(options?.message ?? "已保存到线上。所有访客刷新后都会看到新的文章设置。");
  }

  return (
    <main className="sub-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav showEdit={false} />
      <input ref={secretInputRef} type="file" accept=".txt,.json,.env,.key,text/plain,application/json" className="hidden" onChange={handleSecretImport} />

      {manageMode ? (
        <div className="project-admin-actions posts-admin-actions">
          <button type="button" className="write-small-button" onClick={() => setCategoryPanelOpen(true)}>分类</button>
          <button type="button" className="write-small-button" onClick={cancelManageMode}>取消</button>
          <button type="button" className="write-small-button" onClick={toggleAll}>{allSelected ? "取消全选" : "全选"}</button>
          <button type="button" className="write-small-button danger" onClick={deleteSelected}>删除(已选{selectedIds.length}篇)</button>
          <button type="button" className="write-tool-button primary" onClick={() => secretInputRef.current?.click()}>导入密钥</button>
        </div>
      ) : (
        <button type="button" className="floating-edit" onClick={enterManageMode}>编辑</button>
      )}

      <section className="mx-auto max-w-5xl">
        <div className="posts-switch mx-auto mb-8 flex w-max max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-white/70 bg-white/45 p-1 shadow-lg shadow-slate-300/20 backdrop-blur-xl">
          {tabs.map((tab) => (
            <button key={tab} type="button" className={activeTab === tab ? "posts-tab active" : "posts-tab"} onClick={() => { setActiveTab(tab); setShowAll(false); }}>
              {tab}
            </button>
          ))}
        </div>

        <div className="posts-timeline-space">
          {visibleGroups.map((group, index) => (
            <RevealBlock key={`${activeTab}-${group.label}`} delay={index * 90}>
              <section className={`timeline-year-card glass-panel ${manageMode ? "timeline-edit-mode" : ""}`}>
                <div className="timeline-year-head">
                  <h2>{group.label}</h2>
                  <span>{group.items.length} 篇文章</span>
                  {manageMode ? <button type="button" className="select-group-button" onClick={() => selectGroup(group.items)}>全选该分组</button> : null}
                </div>
                <div className="timeline-list">
                  {group.items.map((post, postIndex) => {
                    const checked = selectedIds.includes(post.id);
                    return manageMode ? (
                      <div key={`${post.date}-${post.title}`} className="timeline-row timeline-edit-row" style={{ transitionDelay: `${postIndex * 35}ms` }}>
                        <button type="button" className={checked ? "post-check checked" : "post-check"} aria-label="选择文章" onClick={() => toggleSelected(post.id)} />
                        <time>{activeTab === "分类" ? post.date.slice(0, 7) : formatMonthDay(post.date)}</time>
                        <span className="timeline-dot" aria-hidden="true" />
                        <input value={post.title} onChange={(event) => updatePost(post.id, { title: event.target.value })} className="timeline-title-input" />
                        <select value={post.category ?? "未分类"} onChange={(event) => changePostCategory(post.id, event.target.value)} className="timeline-category-select">
                          {draftCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                        </select>
                      </div>
                    ) : (
                      <Link key={`${post.date}-${post.title}`} href={post.href} className="timeline-row" style={{ transitionDelay: `${postIndex * 35}ms` }}>
                        <time>{activeTab === "分类" ? post.date.slice(0, 7) : formatMonthDay(post.date)}</time>
                        <span className="timeline-dot" aria-hidden="true" />
                        <strong>{post.title}</strong>
                        {post.read ? <small>已阅读</small> : null}
                        <em>#{activeTab === "分类" ? post.tag : post.tag}</em>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </RevealBlock>
          ))}
        </div>

        {groups.length > visibleGroups.length ? (
          <div className="mt-8 flex justify-center">
            <button type="button" className="more-posts-button" onClick={() => setShowAll(true)}>
              <span>⌄</span> 更多
            </button>
          </div>
        ) : null}

        {manageMode ? <p className="posts-status glass-panel">{status}</p> : null}
      </section>

      {categoryPanelOpen ? (
        <div className="category-modal-backdrop" role="dialog" aria-modal="true" aria-label="文章分类">
          <section className="category-modal glass-panel">
            <div className="category-modal-head">
              <h2>文章分类</h2>
              <button type="button" onClick={() => setCategoryPanelOpen(false)}>关闭</button>
            </div>
            <div className="category-create-row">
              <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="输入分类名称" />
              <button type="button" onClick={addCategory}>新增分类</button>
            </div>
            <div className="category-chip-box">
              {draftCategories.map((category) => (
                <button key={category} type="button" className="category-chip" onClick={() => category !== "未分类" && removeCategory(category)}>
                  {category} {category === "未分类" ? null : <span>×</span>}
                </button>
              ))}
            </div>
            <div className="category-post-list">
              {drafts.map((post) => (
                <div key={post.id} className="category-post-row">
                  <div>
                    <strong>{post.title}</strong>
                    <span>{post.date}</span>
                  </div>
                  <select value={post.category ?? "未分类"} onChange={(event) => changePostCategory(post.id, event.target.value)}>
                    {draftCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
