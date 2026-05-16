import { NextRequest, NextResponse } from "next/server";
import { defaultAboutContent, normalizeAboutContent } from "../../about/aboutData";

const ABOUT_KEY = "yzy-ovo:about";
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
    return NextResponse.json({ content: defaultAboutContent, connected: false });
  }

  try {
    const result = await runRedisCommand(["GET", ABOUT_KEY]);
    if (!result) {
      return NextResponse.json({ content: defaultAboutContent, connected: true, customized: false });
    }

    const parsed = JSON.parse(String(result)) as unknown;
    return NextResponse.json({ content: normalizeAboutContent(parsed), connected: true, customized: true });
  } catch {
    return NextResponse.json({ content: defaultAboutContent, connected: false }, { status: 200 });
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
    const body = (await request.json()) as unknown;
    const content = normalizeAboutContent(body);
    await runRedisCommand(["SET", ABOUT_KEY, JSON.stringify(content)]);
    return NextResponse.json({ content, saved: true });
  } catch {
    return NextResponse.json({ error: "Failed to save about content." }, { status: 500 });
  }
}
