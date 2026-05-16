"use client";

import SiteNav from "../../../components/SiteNav";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { AboutContent, Lang, defaultAboutContent, normalizeAboutContent } from "../aboutData";

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

function updateLangContent(content: AboutContent, lang: Lang, patch: Partial<AboutContent[Lang]>): AboutContent {
  return {
    ...content,
    [lang]: {
      ...content[lang],
      ...patch
    }
  };
}

export default function AboutEditPage() {
  const secretInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<Lang>("zh");
  const [content, setContent] = useState<AboutContent>(defaultAboutContent);
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState("修改个人介绍需要管理员密钥文件；普通访客只能看，不能保存到线上。");
  const current = content[lang];

  const bulletsText = useMemo(() => current.bullets.join("\n"), [current.bullets]);

  useEffect(() => {
    const savedSecret = window.localStorage.getItem("yzy-ovo-admin-secret") ?? "";
    if (savedSecret) setSecret(savedSecret);

    fetch("/api/about", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setContent(normalizeAboutContent(data.content)))
      .catch(() => setContent(defaultAboutContent));
  }, []);

  function updateField(key: keyof AboutContent[Lang], value: string | string[]) {
    setContent((old) => {
      const nextLangContent = { ...old[lang], [key]: value } as AboutContent[Lang];
      return { ...old, [lang]: nextLangContent };
    });
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
      setStatus(`已从 ${file.name} 导入管理员密钥，只保存在当前浏览器。`);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handleJsonImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = normalizeAboutContent(JSON.parse(String(reader.result ?? "{}")));
        setContent(imported);
        setStatus(`已导入 ${file.name}，可以预览后保存。`);
      } catch {
        setStatus("JSON 文件解析失败，请检查格式。");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  async function saveOnline() {
    if (!secret.trim()) {
      setStatus("请先导入管理员密钥文件。");
      return;
    }

    setStatus("正在保存到线上...");
    const response = await fetch("/api/about", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-yzy-admin-secret": secret.trim()
      },
      body: JSON.stringify(content)
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus(data.error ?? "保存失败，请检查 Upstash 和 ADMIN_SECRET 环境变量。");
      return;
    }

    setStatus("已保存到线上。刷新 /about 后，所有访客都会看到新介绍。");
  }

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setStatus("已复制个人介绍 JSON，可留作备份。");
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "about-content.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("已下载个人介绍 JSON 备份。");
  }

  return (
    <main className="about-edit-page min-h-screen px-5 pb-12 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav showEdit={false} />
      <section className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="glass-panel p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="sub-kicker">ABOUT EDITOR</p>
              <h1 className="mt-2 text-3xl font-black text-slate-700">编辑个人介绍</h1>
            </div>
            <div className="flex gap-2">
              <button type="button" className={lang === "zh" ? "lang-chip active" : "lang-chip"} onClick={() => setLang("zh")}>中文</button>
              <button type="button" className={lang === "en" ? "lang-chip active" : "lang-chip"} onClick={() => setLang("en")}>English</button>
            </div>
          </div>

          <div className="space-y-4">
            <input value={current.title} onChange={(event) => updateField("title", event.target.value)} className="write-input" placeholder="页面标题" />
            <input value={current.subtitle} onChange={(event) => updateField("subtitle", event.target.value)} className="write-input" placeholder="副标题，可留空" />
            <input value={current.introTitle} onChange={(event) => updateField("introTitle", event.target.value)} className="write-input" placeholder="介绍标题" />
            <textarea
              value={bulletsText}
              onChange={(event) => updateField("bullets", event.target.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))}
              className="write-textarea about-edit-textarea"
              placeholder="每行一条介绍"
            />
            <input value={current.quoteA} onChange={(event) => updateField("quoteA", event.target.value)} className="write-input" placeholder="引用句 1" />
            <input value={current.quoteB} onChange={(event) => updateField("quoteB", event.target.value)} className="write-input" placeholder="引用句 2" />
            <textarea value={current.contact} onChange={(event) => updateField("contact", event.target.value)} className="write-input min-h-24 resize-none" placeholder="联系说明" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="write-small-button" onClick={copyJson}>复制 JSON</button>
            <button type="button" className="write-small-button" onClick={downloadJson}>下载备份</button>
            <button type="button" className="write-tool-button primary" onClick={saveOnline}>保存到线上</button>
          </div>
        </article>

        <aside className="space-y-6">
          <section className="glass-panel p-6">
            <p className="mb-4 text-sm font-semibold text-slate-700">管理员验证</p>
            <input ref={secretInputRef} type="file" accept=".txt,.json,.env,.key,text/plain,application/json" className="hidden" onChange={handleSecretImport} />
            <button type="button" className="write-tool-button primary w-full" onClick={() => secretInputRef.current?.click()}>导入密钥文件</button>
            <p className="mt-3 text-xs leading-6 text-slate-500">{secret ? "已导入密钥：可以保存到线上。" : "未导入密钥：只能编辑预览，不能保存到线上。"}</p>
          </section>

          <section className="glass-panel p-6">
            <p className="mb-4 text-sm font-semibold text-slate-700">备份 / 导入</p>
            <input ref={jsonInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleJsonImport} />
            <button type="button" className="write-small-button w-full" onClick={() => jsonInputRef.current?.click()}>导入介绍 JSON</button>
            <p className="mt-3 text-xs leading-6 text-slate-500">适合把之前下载的个人介绍备份重新导入。</p>
          </section>

          <section className="glass-panel p-6">
            <p className="mb-4 text-sm font-semibold text-slate-700">实时预览</p>
            <div className="about-edit-preview rounded-3xl bg-white/45 p-5">
              <p className="text-2xl font-black text-slate-700">{current.title || "YZY-OVO"}</p>
              {current.subtitle ? <p className="mt-1 text-sm tracking-[0.18em] text-slate-400">{current.subtitle}</p> : null}
              <p className="mt-5 font-bold text-slate-600"># {current.introTitle}</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
                {current.bullets.map((item) => <li key={item}>・{item}</li>)}
              </ul>
              <p className="mt-4 rounded-2xl bg-cyan-50/70 p-3 text-sm leading-6 text-slate-500">“{current.quoteA}”</p>
            </div>
          </section>

          <p className="rounded-3xl bg-white/40 p-4 text-sm leading-7 text-slate-500">{status}</p>
        </aside>
      </section>
    </main>
  );
}
