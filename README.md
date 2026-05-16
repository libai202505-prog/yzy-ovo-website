# yzy-ovo

A soft blue bilingual personal wiki / dashboard site built with Next.js and Tailwind CSS.

## Update content

Most homepage text and links are in:

```txt
app/page.tsx
```

The about page is in:

```txt
app/about/page.tsx
```

The writing editor page is in:

```txt
app/write/page.tsx
```

The top banner background image is:

```txt
public/hero-bg.webp
```

## Free backend with Upstash Redis

This version includes two backend API routes:

```txt
app/api/likes/route.ts
app/api/comments/route.ts
```

They store:

- total site likes
- public comments visible to all visitors

### Setup on Upstash

1. Create a free Redis database on Upstash.
2. Open the database details page.
3. Copy these two values from the REST API section:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Setup on Vercel

Go to:

```txt
Vercel project -> Settings -> Environment Variables
```

Add:

```txt
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Select `Production` and `Preview`. `Development` is not required for the live website.

Then redeploy the site.

## Writing articles

The homepage write button opens:

```txt
/write
```

This page lets you draft, preview, import Markdown, add cover/meta info, copy Markdown, and download a `.md` file. To publish permanently, add the generated Markdown file to your GitHub repository.

## Reset likes or comments

In Upstash Console, you can delete these keys if you want to reset data:

```txt
yzy-ovo:likes
yzy-ovo:comments
```
