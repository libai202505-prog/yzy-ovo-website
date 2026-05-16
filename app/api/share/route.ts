import { NextRequest, NextResponse } from "next/server";
import { defaultResources, normalizeResources } from "../../share/shareData";

const SHARE_KEY = "yzy-ovo:share-resources";
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
    return NextResponse.json({ resources: defaultResources, connected: false });
  }

  try {
    const result = await runRedisCommand(["GET", SHARE_KEY]);
    if (!result) {
      return NextResponse.json({ resources: defaultResources, connected: true, customized: false });
    }

    const parsed = JSON.parse(String(result)) as unknown;
    return NextResponse.json({ resources: normalizeResources(parsed), connected: true, customized: true });
  } catch {
    return NextResponse.json({ resources: defaultResources, connected: false }, { status: 200 });
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
    const body = (await request.json()) as { resources?: unknown } | unknown;
    const source = typeof body === "object" && body !== null && "resources" in body ? (body as { resources?: unknown }).resources : body;
    const resources = normalizeResources(source);
    await runRedisCommand(["SET", SHARE_KEY, JSON.stringify(resources)]);
    return NextResponse.json({ resources, saved: true });
  } catch {
    return NextResponse.json({ error: "Failed to save resources." }, { status: 500 });
  }
}
