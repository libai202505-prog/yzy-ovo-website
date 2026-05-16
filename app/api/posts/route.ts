import { NextRequest, NextResponse } from "next/server";
import { defaultCategories, defaultPosts, normalizeCategories, normalizePosts } from "../../posts/postData";

const POSTS_KEY = "yzy-ovo:posts";
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

type UpstashResult = {
  result?: unknown;
  error?: string;
};

function isRedisConfigured() {
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

function isAuthorized(request: NextRequest) {
  const supplied = request.headers.get("x-yzy-admin-secret") ?? "";
  return Boolean(ADMIN_SECRET && supplied && supplied === ADMIN_SECRET);
}

export async function GET() {
  if (!isRedisConfigured()) {
    return NextResponse.json({ posts: defaultPosts, categories: defaultCategories, connected: false });
  }

  try {
    const result = await runRedisCommand(["GET", POSTS_KEY]);
    if (!result) {
      return NextResponse.json({ posts: defaultPosts, categories: normalizeCategories(defaultCategories, defaultPosts), connected: true, customized: false });
    }

    const parsed = JSON.parse(String(result)) as { posts?: unknown; categories?: unknown };
    const posts = normalizePosts(parsed.posts);
    const categories = normalizeCategories(parsed.categories, posts);
    return NextResponse.json({ posts, categories, connected: true, customized: true });
  } catch {
    return NextResponse.json({ posts: defaultPosts, categories: defaultCategories, connected: false }, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isRedisConfigured()) {
    return NextResponse.json({ error: "Upstash Redis is not configured." }, { status: 503 });
  }

  if (!ADMIN_SECRET) {
    return NextResponse.json({ error: "ADMIN_SECRET is not configured in Vercel." }, { status: 503 });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Invalid admin secret." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { posts?: unknown; categories?: unknown };
    const posts = normalizePosts(body.posts);
    const categories = normalizeCategories(body.categories, posts);
    await runRedisCommand(["SET", POSTS_KEY, JSON.stringify({ posts, categories })]);
    return NextResponse.json({ posts, categories, saved: true });
  } catch {
    return NextResponse.json({ error: "Failed to save posts." }, { status: 500 });
  }
}
