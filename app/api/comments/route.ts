import { NextRequest, NextResponse } from "next/server";
import {
  MAX_PENDING_COMMENTS,
  allowCommentSubmission,
  cleanText,
  clientIpFromRequest,
  formatCommentDate,
  isRedisConfigured,
  readPublicComments,
  runRedisCommand,
  serializeComment,
  PENDING_KEY
} from "../../../lib/commentsShared";
import { notifyOwnerNewPendingComment } from "../../../lib/commentNotify";

export async function GET() {
  if (!isRedisConfigured()) {
    return NextResponse.json({ comments: [], connected: false, moderation: false });
  }

  try {
    const comments = await readPublicComments();
    return NextResponse.json({ comments, connected: true, moderation: true });
  } catch {
    return NextResponse.json({ comments: [], connected: false, moderation: false }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  if (!isRedisConfigured()) {
    return NextResponse.json({ pending: false, connected: false }, { status: 200 });
  }

  try {
    const ip = clientIpFromRequest(request);
    if (!(await allowCommentSubmission(ip))) {
      return NextResponse.json({ error: "Too many comments. Try again later." }, { status: 429 });
    }

    const body = (await request.json()) as { name?: unknown; text?: unknown };
    const text = cleanText(body.text, 300);

    if (!text) {
      return NextResponse.json({ error: "Comment text is required." }, { status: 400 });
    }

    const comment = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: cleanText(body.name, 24) || "yzy guest",
      text,
      createdAt: formatCommentDate()
    };

    await runRedisCommand(["LPUSH", PENDING_KEY, serializeComment(comment)]);
    await runRedisCommand(["LTRIM", PENDING_KEY, "0", String(MAX_PENDING_COMMENTS - 1)]);

    void notifyOwnerNewPendingComment(comment);

    return NextResponse.json({
      pending: true,
      connected: true,
      message: "Comment submitted for review."
    });
  } catch {
    return NextResponse.json({ pending: false, connected: false }, { status: 200 });
  }
}