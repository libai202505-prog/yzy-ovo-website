/** True when `icon` should render as an image (URL or data URL). */
export function isShareIconImage(icon: string) {
  const value = icon.trim();
  if (!value) return false;
  if (value.startsWith("data:image/")) return true;
  if (value.startsWith("/")) return true;
  return /^https?:\/\//i.test(value);
}

/** Resize/compress for Redis JSON (keeps share list small). */
export async function compressShareIconFile(file: File, maxBytes = 48_000): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择图片文件（PNG/JPG/WebP 等）。");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("读取图片失败。"));
    reader.readAsDataURL(file);
  });

  const bitmap = await createImageBitmap(file);
  const maxSide = 96;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法处理图片。");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.86;
  let out = canvas.toDataURL("image/webp", quality);
  while (out.length > maxBytes && quality > 0.45) {
    quality -= 0.08;
    out = canvas.toDataURL("image/webp", quality);
  }

  if (out.length > maxBytes) {
    out = canvas.toDataURL("image/jpeg", 0.75);
  }
  if (out.length > maxBytes * 1.2) {
    throw new Error("图片压缩后仍偏大，请换更小或更简单的图标。");
  }

  return out || dataUrl;
}