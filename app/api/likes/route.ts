import { NextResponse } from "next/server";

const LIKE_KEY = "yzy-ovo:likes";
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

type UpstashResult = {
  result?: string | number | null;
  error?: string;
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

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ count: 0, connected: false });
  }

  try {
    const result = await runRedisCommand(["GET", LIKE_KEY]);
    return NextResponse.json({ count: Number(result ?? 0), connected: true });
  } catch {
    return NextResponse.json({ count: 0, connected: false }, { status: 200 });
  }
}

export async function POST() {
  if (!isConfigured()) {
    return NextResponse.json({ count: 0, connected: false }, { status: 200 });
  }

  try {
    const result = await runRedisCommand(["INCR", LIKE_KEY]);
    return NextResponse.json({ count: Number(result ?? 0), connected: true });
  } catch {
    return NextResponse.json({ count: 0, connected: false }, { status: 200 });
  }
}
