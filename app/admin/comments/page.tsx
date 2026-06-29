"use client";

import SiteNav from "../../../components/SiteNav";
import { extractSecretFromText } from "../../../lib/adminSecret";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

type CommentItem = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

export default function CommentModerationPage() {
  const secretInputRef = useRef<HTMLInputElement>(null);
  const [secret, setSecret] = useState("");
  const [secretDraft, setSecretDraft] = useState("");
  const [pending, setPending] = useState<CommentItem[]>([]);
  const [published, setPublished] = useState<CommentItem[]>([]);
  const [status, setStatus] = useState("导入或粘贴管理员密钥后可审核。请收藏本页书签，站内导航不展示入口。");
  const [busyId, setBusyId] = useState("");

  const loadQueue = useCallback(async (adminSecret: string) => {
    const response = await fetch("/api/comments/moderate", {
      cache: "no-store",
      headers: { "x-yzy-admin-secret": adminSecret }
    });
    const data = (await response.json()) as {
      pending?: CommentItem[];
      published?: CommentItem[];
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error ?? "加载失败");
    }

    setPending(data.pending ?? []);
    setPublished(data.published ?? []);
    setStatus(`待审核 ${data.pending?.length ?? 0} 条 · 已公开 ${data.published?.length ?? 0} 条`);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("yzy-ovo-admin-secret") ?? "";
    if (!saved) return;

    const frame = window.requestAnimationFrame(() => {
      setSecret(saved);
      setSecretDraft(saved);
      loadQueue(saved).catch((error: Error) => setStatus(error.message));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loadQueue]);

  function applySecret(value: string) {
    const imported = extractSecretFromText(value);
    if (!imported) {
      setStatus("密钥为空或格式不对。");
      return;
    }
    setSecret(imported);
    setSecretDraft(imported);
    window.localStorage.setItem("yzy-ovo-admin-secret", imported);
    loadQueue(imported).catch((error: Error) => setStatus(error.message));
  }

  function handleSecretImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      applySecret(String(reader.result ?? ""));
      setStatus(`已从 ${file.name} 导入密钥（仅保存在本浏览器）。`);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  async function moderate(action: "approve" | "reject" | "delete_published", id: string, label?: string) {
    if (!secret) {
      setStatus("请先导入或粘贴管理员密钥。");
      return;
    }

    if (action === "delete_published") {
      const item = published.find((c) => c.id === id);
      const preview = item ? `「${item.text.slice(0, 40)}${item.text.length > 40 ? "…" : ""}」` : "这条留言";
      if (!window.confirm(`确定从首页删除 ${preview}？删除后不可恢复。`)) return;
    }

    setBusyId(id);
    try {
      const response = await fetch("/api/comments/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-yzy-admin-secret": secret
        },
        body: JSON.stringify({ action, id })
      });
      const data = (await response.json()) as { pending?: CommentItem[]; published?: CommentItem[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "操作失败");
      setPending(data.pending ?? []);
      setPublished(data.published ?? []);
      if (action === "approve") setStatus("已通过并公开显示。");
      else if (action === "reject") setStatus("已拒绝，未公开。");
      else setStatus(label ?? "已从首页删除。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "操作失败");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="min-h-screen px-4 pb-10 pt-6 text-slate-700 sm:px-6 lg:px-10">
      <div className="site-shell mx-auto max-w-3xl">
        <SiteNav />
        <article className="glass-panel mt-6 p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-500">Moderation</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-700">留言审核</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">{status}</p>

          <div className="mt-6 space-y-3">
            <label className="block text-sm font-medium text-slate-600">
              管理员密钥（与 Vercel 的 ADMIN_SECRET 相同）
              <input
                type="password"
                autoComplete="off"
                className="comment-input mt-2 w-full"
                placeholder="粘贴密钥或从本地文件导入"
                value={secretDraft}
                onChange={(event) => setSecretDraft(event.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="comment-submit" onClick={() => applySecret(secretDraft)}>
                使用此密钥
              </button>
              <button type="button" className="project-link home-project-link" onClick={() => secretInputRef.current?.click()}>
                从文件导入
              </button>
              <button
                type="button"
                className="project-link home-project-link"
                disabled={!secret}
                onClick={() => loadQueue(secret).catch((error: Error) => setStatus(error.message))}
              >
                刷新列表
              </button>
              <input
                ref={secretInputRef}
                type="file"
                accept=".txt,.json,.env,.key,text/plain,application/json"
                className="hidden"
                onChange={handleSecretImport}
              />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">待审核</h2>
            {pending.length === 0 ? (
              <p className="text-sm text-slate-500">当前没有待审核留言。</p>
            ) : (
              pending.map((comment) => (
                <div key={comment.id} className="comment-item rounded-3xl bg-white/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-700">{comment.name}</span>
                    <span className="text-xs text-slate-400">{comment.createdAt}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{comment.text}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="comment-submit"
                      disabled={busyId === comment.id}
                      onClick={() => moderate("approve", comment.id)}
                    >
                      通过并公开
                    </button>
                    <button
                      type="button"
                      className="project-link home-project-link"
                      disabled={busyId === comment.id}
                      onClick={() => moderate("reject", comment.id)}
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-slate-700">已公开（首页展示，最多 50 条）</h2>
            <p className="mt-1 text-xs text-slate-400">列表可滚动；误通过的留言可点「从首页删除」。</p>
            {published.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">暂无已审核通过的留言。</p>
            ) : (
              <div className="comment-list-panel comment-list-panel--admin mt-4">
                {published.map((comment) => (
                  <div key={comment.id} className="comment-item rounded-3xl bg-white/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-slate-600">{comment.name}</span>
                      <span className="text-xs text-slate-400">{comment.createdAt}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{comment.text}</p>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="project-link home-project-link comment-delete-btn"
                        disabled={busyId === comment.id}
                        onClick={() => moderate("delete_published", comment.id, "已从首页删除该留言。")}
                      >
                        从首页删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}