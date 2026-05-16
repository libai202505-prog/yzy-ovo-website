import { NextRequest, NextResponse } from "next/server";

const COMMENTS_KEY = "yzy-ovo:comments";
const MAX_COMMENTS = 50;
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

type UpstashResult = {
  result?: unknown;
  error?: string;
};

type CommentItem = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

function isConfigured() {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

async function runRedisCommand(command: string[]) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    throw new Error("Upstash Redis is not configured.");
  }

  const path = command.map((part) => encodeURIComponent(part)).join("/");
  const response = await fetch(`${UPSTASH_URL}/${path}`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`
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

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

function formatDate() {
  return new Date().toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function parseComments(result: unknown): CommentItem[] {
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

async function readComments() {
  const result = await runRedisCommand(["LRANGE", COMMENTS_KEY, "0", String(MAX_COMMENTS - 1)]);
  return parseComments(result);
}

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ comments: [], connected: false });
  }

  try {
    const comments = await readComments();
    return NextResponse.json({ comments, connected: true });
  } catch {
    return NextResponse.json({ comments: [], connected: false }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ comments: [], connected: false }, { status: 200 });
  }

  try {
    const body = (await request.json()) as { name?: unknown; text?: unknown };
    const text = cleanText(body.text, 300);

    if (!text) {
      return NextResponse.json({ error: "Comment text is required." }, { status: 400 });
    }

    const comment: CommentItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: cleanText(body.name, 24) || "yzy guest",
      text,
      createdAt: formatDate()
    };

    await runRedisCommand(["LPUSH", COMMENTS_KEY, JSON.stringify(comment)]);
    await runRedisCommand(["LTRIM", COMMENTS_KEY, "0", String(MAX_COMMENTS - 1)]);
    const comments = await readComments();

    return NextResponse.json({ comment, comments, connected: true });
  } catch {
    return NextResponse.json({ comments: [], connected: false }, { status: 200 });
  }
}
