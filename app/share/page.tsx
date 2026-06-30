"use client";

import SiteNav from "../../components/SiteNav";
import { CardResourceIcon, IconPathEditor } from "../../components/IconPathEditor";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { ResourceItem, defaultResources, getResourceCategories, normalizeResources } from "./shareData";

function starText(count: number) {
  return "★".repeat(count) + "☆".repeat(Math.max(0, 5 - count));
}

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

function makeResource(): ResourceItem {
  const stamp = Date.now().toString(36);
  return {
    id: `resource-${stamp}`,
    title: "新的推荐",
    url: "https://",
    desc: "写一段推荐理由。",
    category: "Learning",
    tags: ["Learning"],
    icon: "★",
    stars: 5,
    meta: "资源"
  };
}

function tagsToText(tags: string[]) {
  return tags.join(", ");
}

function textToTags(text: string) {
  return text
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export default function SharePage() {
  const secretInputRef = useRef<HTMLInputElement>(null);
  const [resources, setResources] = useState<ResourceItem[]>(defaultResources);
  const [drafts, setDrafts] = useState<ResourceItem[]>(defaultResources);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("全部");
  const [picked, setPicked] = useState<ResourceItem | null>(null);
  const [secret, setSecret] = useState("");
  const [manageMode, setManageMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("点击右上角编辑后，可以添加、编辑、删除推荐资源。保存到线上前需要导入管理员密钥。");

  useEffect(() => {
    const savedSecret = window.localStorage.getItem("yzy-ovo-admin-secret") ?? "";
    if (savedSecret) setSecret(savedSecret);

    fetch("/api/share", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const nextResources = normalizeResources(data.resources);
        setResources(nextResources);
        setDrafts(nextResources);
      })
      .catch(() => {
        setResources(defaultResources);
        setDrafts(defaultResources);
      });
  }, []);

  const visibleResources = manageMode ? drafts : resources;
  const categories = useMemo(() => getResourceCategories(visibleResources), [visibleResources]);

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return visibleResources.filter((item) => {
      const matchesCategory = active === "全部" || item.category === active || item.tags.includes(active);
      const matchesQuery = !lower || [item.title, item.desc, item.category, item.meta, ...item.tags].join(" ").toLowerCase().includes(lower);
      return matchesCategory && matchesQuery;
    });
  }, [query, active, visibleResources]);

  function enterManageMode() {
    setDrafts(resources);
    setManageMode(true);
    setEditingId(null);
    setStatus(secret ? "已导入密钥，可以编辑推荐资源并保存到线上。" : "编辑模式已打开。请先导入管理员密钥文件，再保存到线上。");
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
      setStatus(`已导入密钥文件：${file.name}。现在可以编辑推荐资源，点卡片右上角完成会自动保存到线上。`);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function pickRandom() {
    const pool = filtered.length ? filtered : visibleResources;
    const index = Math.floor(Math.random() * pool.length);
    setPicked(pool[index]);
  }

  function updateResource(id: string, patch: Partial<ResourceItem>) {
    setDrafts((old) => old.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function startEdit(id: string) {
    setManageMode(true);
    setEditingId(id);
    setStatus(secret ? "正在原卡片中编辑。修改后点卡片右上角完成，会自动保存到线上。" : "可以先本地编辑预览；保存到线上前需要导入管理员密钥文件。");
  }

  function completeInlineEdit() {
    setEditingId(null);
    if (secret.trim()) {
      void saveOnline({ stayInManageMode: true, message: "已完成并保存到线上。" });
    } else {
      setStatus("已完成本地编辑。导入密钥后，再编辑并点卡片完成即可保存到线上。");
    }
  }

  function cancelInlineEdit(id: string) {
    const original = resources.find((item) => item.id === id);
    if (original) {
      setDrafts((old) => old.map((item) => (item.id === id ? original : item)));
    } else {
      setDrafts((old) => old.filter((item) => item.id !== id));
    }
    setEditingId(null);
    setStatus("已取消本张卡片的未完成修改。");
  }

  function addResource() {
    const next = makeResource();
    setManageMode(true);
    setDrafts((old) => [next, ...old]);
    setEditingId(next.id);
    setActive("全部");
    setStatus(secret ? "已添加一个新推荐，请直接在卡片里修改内容。" : "已添加本地草稿；保存到线上前需要导入管理员密钥文件。");
  }

  function deleteResource(id: string) {
    const next = drafts.filter((item) => item.id !== id);
    const nextDrafts = next.length ? next : [makeResource()];
    setDrafts(nextDrafts);
    if (editingId === id) setEditingId(null);
    if (secret.trim()) {
      void saveOnline({ resourcesToSave: nextDrafts, stayInManageMode: true, message: "已删除并保存到线上。" });
    } else {
      setStatus("已从本地草稿中删除；保存到线上前需要导入管理员密钥文件。");
    }
  }

  function cancelChanges() {
    setDrafts(resources);
    setEditingId(null);
    setManageMode(false);
    setStatus("已取消未保存的推荐资源修改。");
  }

  async function saveOnline(options?: { resourcesToSave?: ResourceItem[]; stayInManageMode?: boolean; message?: string }) {
    const key = secret.trim();
    if (!key) {
      setStatus("请先导入管理员密钥文件。导入后再点推荐卡片里的完成保存到线上。");
      return;
    }

    const resourcesToSave = options?.resourcesToSave ?? drafts;
    setStatus("正在保存推荐资源到线上...");
    const response = await fetch("/api/share", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-yzy-admin-secret": key
      },
      body: JSON.stringify({ resources: resourcesToSave })
    });

    const data = (await response.json()) as { resources?: ResourceItem[]; error?: string };
    if (!response.ok) {
      setStatus(data.error ?? "保存失败，请检查 Upstash 和 ADMIN_SECRET 环境变量。");
      return;
    }

    const savedResources = normalizeResources(data.resources ?? resourcesToSave);
    setResources(savedResources);
    setDrafts(savedResources);
    setPicked(null);
    setEditingId(null);
    setManageMode(Boolean(options?.stayInManageMode));
    setStatus(options?.message ?? "已保存到线上。刷新 /share 后，所有访客都会看到新推荐列表。");
  }

  return (
    <main className="sub-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav showEdit={false} />
      <input ref={secretInputRef} type="file" accept=".txt,.json,.env,.key,text/plain,application/json" className="hidden" onChange={handleSecretImport} />

      {manageMode ? (
        <div className="project-admin-actions share-admin-actions">
          <button type="button" className="write-small-button" onClick={cancelChanges}>取消</button>
          <button type="button" className="write-small-button" onClick={addResource}>添加</button>
          <button type="button" className="write-tool-button primary" onClick={() => secretInputRef.current?.click()}>导入密钥</button>
        </div>
      ) : (
        <button type="button" className="floating-edit" onClick={enterManageMode}>编辑</button>
      )}

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
          {filtered.map((item, index) => {
            const isEditing = manageMode && editingId === item.id;
            const cardClass = `resource-card glass-panel ${manageMode ? "share-edit-card" : ""} ${isEditing ? "share-inline-editing" : ""} reveal-card`;
            const delay = { animationDelay: `${index * 60}ms` };
            return (
              <article key={item.id} className={cardClass} style={delay}>
                {manageMode ? (
                  <div className="project-card-actions share-card-actions">
                    {isEditing ? (
                      <>
                        <button type="button" onClick={() => cancelInlineEdit(item.id)}>取消</button>
                        <button type="button" className="done" onClick={completeInlineEdit}>完成</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(item.id)}>编辑</button>
                        <button type="button" className="danger" onClick={() => deleteResource(item.id)}>删除</button>
                      </>
                    )}
                  </div>
                ) : null}

                {isEditing ? (
                  <>
                    <div className="share-edit-icon-row">
                      <IconPathEditor
                        icon={item.icon}
                        onChange={(icon) => updateResource(item.id, { icon })}
                        onStatus={setStatus}
                        defaultSymbol="★"
                      />
                    </div>
                    <div className="share-edit-main">
                        <input className="project-inline-input share-title-input" value={item.title} onChange={(event) => updateResource(item.id, { title: event.target.value })} placeholder="资源标题" />
                        <input className="project-inline-input share-url-input" value={item.url} onChange={(event) => updateResource(item.id, { url: event.target.value })} placeholder="https://..." />
                    </div>
                    <div className="share-edit-row">
                      <input className="project-inline-input" value={item.category} onChange={(event) => updateResource(item.id, { category: event.target.value })} placeholder="分类" />
                      <input className="project-inline-input" type="number" min={0} max={5} value={item.stars} onChange={(event) => updateResource(item.id, { stars: Number(event.target.value) })} placeholder="星级 0-5" />
                    </div>
                    <input className="project-inline-input" value={tagsToText(item.tags)} onChange={(event) => updateResource(item.id, { tags: textToTags(event.target.value) })} placeholder="标签，用逗号分隔" />
                    <textarea className="project-inline-input share-desc-input" value={item.desc} onChange={(event) => updateResource(item.id, { desc: event.target.value })} placeholder="资源说明" />
                    <input className="project-inline-input" value={item.meta} onChange={(event) => updateResource(item.id, { meta: event.target.value })} placeholder="来源 / 备注" />
                  </>
                ) : (
                  <a href={item.url} target="_blank" rel="noreferrer" className="resource-card-link" aria-label={`打开 ${item.title}`}>
                    <div className="resource-card-top">
                      <CardResourceIcon icon={item.icon} />
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
                )}
              </article>
            );
          })}
        </div>

        {manageMode ? <p className="project-editor-status share-editor-status">{status}</p> : null}
      </section>
    </main>
  );
}
