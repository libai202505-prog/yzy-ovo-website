"use client";

import SiteNav from "../../components/SiteNav";
import { CardResourceIcon, IconPathEditor } from "../../components/IconPathEditor";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ProjectItem, defaultProjects, normalizeProjects } from "./projectData";

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

function makeProject(): ProjectItem {
  const stamp = Date.now().toString(36);
  return {
    id: `project-${stamp}`,
    title: "新的项目",
    year: String(new Date().getFullYear()),
    tag: "Project",
    summary: "写一段项目简介。",
    website: "/",
    github: "https://github.com/libai202505-prog",
    cover: "/avatar.webp"
  };
}

export default function ProjectsPage() {
  const secretInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<ProjectItem[]>(defaultProjects);
  const [drafts, setDrafts] = useState<ProjectItem[]>(defaultProjects);
  const [secret, setSecret] = useState("");
  const [manageMode, setManageMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("点击右上角编辑后，可以添加、编辑、删除项目。保存到线上前需要导入管理员密钥。");

  useEffect(() => {
    const savedSecret = window.localStorage.getItem("yzy-ovo-admin-secret") ?? "";
    if (savedSecret) setSecret(savedSecret);

    fetch("/api/projects", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const nextProjects = normalizeProjects(data.projects);
        setProjects(nextProjects);
        setDrafts(nextProjects);
      })
      .catch(() => {
        setProjects(defaultProjects);
        setDrafts(defaultProjects);
      });
  }, []);

  function enterManageMode() {
    setDrafts(projects);
    setManageMode(true);
    setEditingId(null);
    setStatus(secret ? "已导入密钥，可以编辑项目并保存到线上。" : "编辑模式已打开。请先导入管理员密钥文件，再保存到线上。");
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
      setStatus(`已导入密钥文件：${file.name}。现在可以编辑项目，点卡片右上角完成会自动保存到线上。`);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function updateProject(id: string, patch: Partial<ProjectItem>) {
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
    const original = projects.find((item) => item.id === id);
    if (original) {
      setDrafts((old) => old.map((item) => (item.id === id ? original : item)));
    } else {
      setDrafts((old) => old.filter((item) => item.id !== id));
    }
    setEditingId(null);
    setStatus("已取消本张卡片的未完成修改。");
  }

  function addProject() {
    const next = makeProject();
    setManageMode(true);
    setDrafts((old) => [next, ...old]);
    setEditingId(next.id);
    setStatus(secret ? "已添加一个新项目，请直接在卡片里修改内容。" : "已添加本地草稿；保存到线上前需要导入管理员密钥文件。");
  }

  function deleteProject(id: string) {
    const next = drafts.filter((item) => item.id !== id);
    const nextDrafts = next.length ? next : [makeProject()];
    setDrafts(nextDrafts);
    if (editingId === id) setEditingId(null);
    if (secret.trim()) {
      void saveOnline({ projectsToSave: nextDrafts, stayInManageMode: true, message: "已删除并保存到线上。" });
    } else {
      setStatus("已从本地草稿中删除；保存到线上前需要导入管理员密钥文件。");
    }
  }

  function cancelChanges() {
    setDrafts(projects);
    setEditingId(null);
    setManageMode(false);
    setStatus("已取消未保存的项目修改。");
  }

  async function saveOnline(options?: { projectsToSave?: ProjectItem[]; stayInManageMode?: boolean; message?: string }) {
    const key = secret.trim();
    if (!key) {
      setStatus("请先导入管理员密钥文件。导入后再点项目卡片里的完成保存到线上。");
      return;
    }

    const projectsToSave = options?.projectsToSave ?? drafts;
    setStatus("正在保存项目到线上...");
    const response = await fetch("/api/projects", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-yzy-admin-secret": key
      },
      body: JSON.stringify({ projects: projectsToSave })
    });

    const data = (await response.json()) as { projects?: ProjectItem[]; error?: string };
    if (!response.ok) {
      setStatus(data.error ?? "保存失败，请检查 Upstash 和 ADMIN_SECRET 环境变量。");
      return;
    }

    const savedProjects = normalizeProjects(data.projects ?? projectsToSave);
    setProjects(savedProjects);
    setDrafts(savedProjects);
    setEditingId(null);
    setManageMode(Boolean(options?.stayInManageMode));
    setStatus(options?.message ?? "已保存到线上。刷新 /projects 后，所有访客都会看到新项目列表。");
  }

  const visibleProjects = manageMode ? drafts : projects;

  return (
    <main className="sub-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav showEdit={false} />
      <input ref={secretInputRef} type="file" accept=".txt,.json,.env,.key,text/plain,application/json" className="hidden" onChange={handleSecretImport} />

      {manageMode ? (
        <div className="project-admin-actions">
          <button type="button" className="write-small-button" onClick={cancelChanges}>取消</button>
          <button type="button" className="write-small-button" onClick={addProject}>添加</button>
          <button type="button" className="write-tool-button primary" onClick={() => secretInputRef.current?.click()}>导入密钥</button>
        </div>
      ) : (
        <button type="button" className="floating-edit" onClick={enterManageMode}>编辑</button>
      )}

      <section className="mx-auto max-w-6xl">
        <div className="sub-heading">
          <p className="sub-kicker">PROJECTS</p>
          <h1>我的项目</h1>
          <p>把已经完成和正在慢慢生长的网页作品放在这里。</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {visibleProjects.map((project, index) => {
            const isEditing = manageMode && editingId === project.id;
            return (
              <article key={project.id} className={`sub-card project-list-card glass-panel project-view-card ${manageMode ? "project-edit-card" : ""} ${isEditing ? "project-inline-editing" : ""} reveal-card`} style={{ animationDelay: `${index * 70}ms` }}>
                {manageMode ? (
                  <div className="project-card-actions">
                    {isEditing ? (
                      <>
                        <button type="button" onClick={() => cancelInlineEdit(project.id)}>取消</button>
                        <button type="button" className="done" onClick={completeInlineEdit}>完成</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(project.id)}>编辑</button>
                        <button type="button" className="danger" onClick={() => deleteProject(project.id)}>删除</button>
                      </>
                    )}
                  </div>
                ) : null}
                {isEditing ? (
                  <div className="project-cover-edit-wrap">
                    <IconPathEditor
                      icon={project.cover}
                      onChange={(cover) => updateProject(project.id, { cover })}
                      onStatus={setStatus}
                      previewClassName="resource-icon project-list-cover"
                      pathPlaceholder="/icons/gufeng1.jpg 或 /avatar.webp"
                      defaultSymbol="/avatar.webp"
                    />
                  </div>
                ) : null}
                <div className="project-card-body">
                {!isEditing ? (
                  <CardResourceIcon icon={project.cover} className="resource-icon project-list-cover" defaultSymbol="★" />
                ) : null}
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <>
                      <div className="project-inline-title-row">
                        <input className="project-inline-input project-title-input" value={project.title} onChange={(event) => updateProject(project.id, { title: event.target.value })} placeholder="项目名称" />
                        <input className="project-inline-input project-year-input" value={project.year} onChange={(event) => updateProject(project.id, { year: event.target.value })} placeholder="年份" />
                      </div>
                      <input className="project-inline-input project-tag-input" value={project.tag} onChange={(event) => updateProject(project.id, { tag: event.target.value })} placeholder="标签" />
                      <textarea className="project-inline-input project-inline-summary" value={project.summary} onChange={(event) => updateProject(project.id, { summary: event.target.value })} placeholder="项目简介" />
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <input className="project-inline-input" value={project.website} onChange={(event) => updateProject(project.id, { website: event.target.value })} placeholder="Website 链接" />
                        <input className="project-inline-input" value={project.github} onChange={(event) => updateProject(project.id, { github: event.target.value })} placeholder="GitHub 链接" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2>{project.title}</h2>
                        <span>{project.year}</span>
                      </div>
                      <em>{project.tag}</em>
                      <p>{project.summary}</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <a href={project.website} target={project.website.startsWith("http") ? "_blank" : undefined} rel={project.website.startsWith("http") ? "noreferrer" : undefined} className="project-link primary">Website</a>
                        <a href={project.github} target="_blank" rel="noreferrer" className="project-link">GitHub</a>
                      </div>
                    </>
                  )}
                </div>
                </div>
              </article>
            );
          })}
        </div>

        {manageMode ? (
          <p className="project-status mt-6 rounded-3xl bg-white/40 p-4 text-sm leading-7 text-slate-500">
            {status}
          </p>
        ) : null}
      </section>
    </main>
  );
}
