import { NextRequest, NextResponse } from "next/server";
import {
  COMMENTS_KEY,
  MAX_PUBLIC_COMMENTS,
  PENDING_KEY,
  type CommentItem,
  isRedisConfigured,
  readPendingComments,
  readPublicComments,
  runRedisCommand,
  serializeComment
} from "../../../../lib/commentsShared";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAuthorized(request: NextRequest) {
  const supplied = request.headers.get("x-yzy-admin-secret") ?? "";
  return Boolean(ADMIN_SECRET && supplied && supplied === ADMIN_SECRET);
}

async function removePendingById(id: string) {
  const pending = await readPendingComments();
  const target = pending.find((item) => item.id === id);
  if (!target) return null;

  await runRedisCommand(["LREM", PENDING_KEY, "1", serializeComment(target)]);
  return target;
}

export async function GET(request: NextRequest) {
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
    const [pending, published] = await Promise.all([readPendingComments(), readPublicComments()]);
    return NextResponse.json({ pending, published, connected: true });
  } catch {
    return NextResponse.json({ error: "Failed to load moderation queue." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const body = (await request.json()) as { action?: string; id?: string };
    const action = String(body.action ?? "").trim();
    const id = String(body.id ?? "").trim();

    if (!id || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "action must be approve or reject, with id." }, { status: 400 });
    }

    const comment = await removePendingById(id);
    if (!comment) {
      return NextResponse.json({ error: "Pending comment not found." }, { status: 404 });
    }

    if (action === "approve") {
      await runRedisCommand(["LPUSH", COMMENTS_KEY, serializeComment(comment)]);
      await runRedisCommand(["LTRIM", COMMENTS_KEY, "0", String(MAX_PUBLIC_COMMENTS - 1)]);
    }

    const [pending, published] = await Promise.all([readPendingComments(), readPublicComments()]);
    return NextResponse.json({
      ok: true,
      action,
      comment: comment as CommentItem,
      pending,
      published
    });
  } catch {
    return NextResponse.json({ error: "Moderation action failed." }, { status: 500 });
  }
}