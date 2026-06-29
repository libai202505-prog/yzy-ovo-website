export async function notifyOwnerNewPendingComment(comment: { name: string; text: string; createdAt: string }) {
  const token = process.env.TELEGRAM_NOTIFY_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_NOTIFY_CHAT_ID;
  if (!token || !chatId) return;

  const site = process.env.SITE_PUBLIC_URL ?? "https://www.yaozhouye.com";
  const adminUrl = `${site.replace(/\/$/, "")}/admin/comments`;
  const preview = comment.text.length > 120 ? `${comment.text.slice(0, 120)}…` : comment.text;

  const text = [
    "新留言待审核",
    `昵称：${comment.name}`,
    `时间：${comment.createdAt}`,
    "",
    preview,
    "",
    `审核：${adminUrl}`
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      }),
      cache: "no-store"
    });
  } catch {
    // Notification must not block comment submission.
  }
}