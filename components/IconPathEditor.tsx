"use client";

import { ChangeEvent, useRef } from "react";
import { compressShareIconFile, isShareIconImage } from "../lib/shareIcon";

export function CardResourceIcon({
  icon,
  className = "resource-icon",
  defaultSymbol = "★"
}: {
  icon: string;
  className?: string;
  defaultSymbol?: string;
}) {
  if (isShareIconImage(icon)) {
    return (
      <div className={`${className} resource-icon--image`}>
        <img src={icon} alt="" />
      </div>
    );
  }
  return <div className={`${className} share-icon-preview-text`}>{icon || defaultSymbol}</div>;
}

type IconPathEditorProps = {
  icon: string;
  onChange: (icon: string) => void;
  defaultSymbol?: string;
  previewClassName?: string;
  pathPlaceholder?: string;
  onStatus?: (message: string) => void;
};

export function IconPathEditor({
  icon,
  onChange,
  defaultSymbol = "★",
  previewClassName = "resource-icon",
  pathPlaceholder = "/icons/gufeng1.jpg 或符号 ★",
  onStatus
}: IconPathEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    onStatus?.("正在压缩图标…");
    try {
      const dataUrl = await compressShareIconFile(file);
      onChange(dataUrl);
      onStatus?.("图标已上传（点「完成」后保存到线上）。");
    } catch (error) {
      onStatus?.(error instanceof Error ? error.message : "图标上传失败。");
    }
  }

  return (
    <div className="icon-path-editor-block">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileImport} />
      <div className="share-icon-editor">
        <CardResourceIcon icon={icon} className={previewClassName} defaultSymbol={defaultSymbol} />
        <div className="share-icon-tools">
          <button type="button" className="share-icon-tool-btn" onClick={() => fileRef.current?.click()}>
            上传图片
          </button>
          {isShareIconImage(icon) ? (
            <button type="button" className="share-icon-tool-btn" onClick={() => onChange(defaultSymbol)}>
              改回默认
            </button>
          ) : null}
        </div>
      </div>
      <label className="share-icon-path-label">
        图标路径
        <input
          className="share-icon-path-input"
          value={icon.startsWith("data:") ? "" : icon}
          onChange={(event) => onChange(event.target.value)}
          placeholder={pathPlaceholder}
          aria-label="图标路径或符号"
          disabled={icon.startsWith("data:")}
        />
      </label>
      {icon.startsWith("data:") ? (
        <p className="share-icon-hint">当前为上传图片。要改用 public/icons 路径，请先点「改回默认」再填路径。</p>
      ) : (
        <p className="share-icon-hint">
          文件放在 <code>public/icons/</code> 后 push 部署，填 <code>/icons/文件名.jpg</code>；符号如 <code>★</code> 也可。
        </p>
      )}
    </div>
  );
}

export function ProjectCoverImage({ cover }: { cover: string }) {
  const src = cover.trim() || "/avatar.webp";
  if (isShareIconImage(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" width={78} height={78} className="post-cover object-cover rounded-2xl" />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/avatar.webp" alt="" width={78} height={78} className="post-cover object-cover rounded-2xl" />
  );
}