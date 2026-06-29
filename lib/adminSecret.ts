/** Parse ADMIN_SECRET from pasted text or imported key file (same as /about/edit). */
export function extractSecretFromText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const candidate =
      parsed.ADMIN_SECRET ?? parsed.adminSecret ?? parsed.secret ?? parsed.key ?? parsed.token ?? parsed.value;
    if (typeof candidate === "string") return candidate.trim();
  } catch {
    // plain text / .env
  }

  const line = trimmed
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith("#"));

  if (!line) return "";
  return line.includes("=")
    ? line
        .split("=")
        .slice(1)
        .join("=")
        .replace(/^['"]|['"]$/g, "")
        .trim()
    : line;
}