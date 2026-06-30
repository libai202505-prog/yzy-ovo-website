# yzy-ovo

A soft blue bilingual personal wiki / dashboard site built with Next.js and Tailwind CSS.

Live site: [yaozhouye.com](https://www.yaozhouye.com/)

## Stack

- **Next.js** (App Router), **Tailwind CSS**
- **Upstash Redis** (REST) for likes, comments, and editable site content via API routes under `app/api/`

## Local development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Environment variables

Configure these in your host (e.g. Vercel **Settings → Environment Variables**). **Do not commit secrets to Git.**

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `ADMIN_SECRET` | Long random secret for owner-only edit/save APIs (e.g. about editor, moderation). Use 24+ characters. |

Optional (owner notifications):

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_NOTIFY_BOT_TOKEN` | Bot token for optional alerts |
| `TELEGRAM_NOTIFY_CHAT_ID` | Your Telegram chat id |
| `SITE_PUBLIC_URL` | Public site URL used in notification links |

Create a free Redis database on [Upstash](https://upstash.com/), then copy the REST URL and token from the console.

After changing env vars, redeploy.

## Content & pages

| Area | Location |
|------|----------|
| Homepage copy & layout | `app/page.tsx` |
| About | `app/about/page.tsx` |
| Writing / Markdown draft | `app/write/page.tsx` |
| Hero background | `public/hero-bg.webp` |

Articles drafted in `/write` can be published by adding the generated Markdown to the repo. Share and project cards are edited in-app when Redis and `ADMIN_SECRET` are configured.

## Security note

This is a **personal site** repo. Admin and moderation UIs exist in the codebase but are **not linked from public navigation**. Keep `ADMIN_SECRET` and Redis credentials only in environment variables. For a detailed private ops checklist, copy `docs/DEPLOYMENT.private.md.example` to `DEPLOYMENT.private.md` locally (that filename is gitignored).

## License

Personal project — use as inspiration; no warranty.