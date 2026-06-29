export type CommentItem = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

export const COMMENTS_KEY = "yzy-ovo:comments";
export const PENDING_KEY = "yzy-ovo:comments:pending";
export const MAX_PUBLIC_COMMENTS = 50;
export const MAX_PENDING_COMMENTS = 100;
export const COMMENT_RATE_PREFIX = "yzy-ovo:comment-rate:";
export const COMMENT_RATE_LIMIT = 8;
export const COMMENT_RATE_WINDOW_SEC = 3600;

type UpstashResult = {
  result?: unknown;
  error?: string;
};

export function isRedisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function runRedisCommand(command: string[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis is not configured.");
  }

  const path = command.map((part) => encodeURIComponent(part)).join("/");
  const response = await fetch(`${url}/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed: ${response.status}`);
  }

  const data = (await response.json()) as UpstashResult;
  if (data.error) {
    throw new Error(data.error);
  }

  return data.result;
}

export function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function formatCommentDate() {
  return new Date().toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function parseComments(result: unknown): CommentItem[] {
  if (!Array.isArray(result)) return [];

  return result
    .map((item) => {
      try {
        const parsed = JSON.parse(String(item)) as CommentItem;
        if (!parsed.id || !parsed.text) return null;
        return parsed;
      } catch {
        return null;
      }
    })
    .filter((item): item is CommentItem => Boolean(item));
}

export async function readPublicComments() {
  const result = await runRedisCommand(["LRANGE", COMMENTS_KEY, "0", String(MAX_PUBLIC_COMMENTS - 1)]);
  return parseComments(result);
}

export async function readPendingComments() {
  const result = await runRedisCommand(["LRANGE", PENDING_KEY, "0", String(MAX_PENDING_COMMENTS - 1)]);
  return parseComments(result);
}

export function serializeComment(comment: CommentItem) {
  return JSON.stringify(comment);
}

export function clientIpFromRequest(request: { headers: { get(name: string): string | null } }) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}

/** Returns true if under rate limit. */
export async function allowCommentSubmission(ip: string) {
  const key = `${COMMENT_RATE_PREFIX}${ip}`;
  const count = Number(await runRedisCommand(["INCR", key]));
  if (count === 1) {
    await runRedisCommand(["EXPIRE", key, String(COMMENT_RATE_WINDOW_SEC)]);
  }
  return count <= COMMENT_RATE_LIMIT;
}