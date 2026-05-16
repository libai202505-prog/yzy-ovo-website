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

## Free backend with Upstash Redis

This version includes two backend API routes:

```txt
app/api/likes/route.ts
app/api/comments/route.ts
```

They store:

- total site likes
- public comments visible to all visitors

If Upstash environment variables are missing, the site will still work and fall back to local browser mode.

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

Select Production, Preview, and Development if Vercel offers those checkboxes. Then redeploy the site.

## Public comments vs private messages

This version uses public comments. That is better for a personal site because visitors can interact with the page and see the conversation.

Private or sensitive messages should not be posted in the comment box. Use the Email button instead.

## Reset likes or comments

In Upstash Console, you can delete these keys if you want to reset data:

```txt
yzy-ovo:likes
yzy-ovo:comments
```
