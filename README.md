# yzy-ovo personal wiki

A soft blue bilingual personal wiki dashboard built with Next.js, Tailwind CSS, and React.

## What changed in this version

- Moved the language switch to the top-right corner.
- Added a separate `/about` page for personal introduction.
- Updated nav hover style: white row with deep-green icon.
- Updated weather project GitHub link to `libai202505-prog/weather-websites-of-y`.
- Reworked the RedNote icon to a clearer app-style local SVG.
- Removed the borrowed fake like count and reset the local counter to start from 0.
- Kept likes/comments as a front-end local demo. For shared visitor-wide data, connect a backend service such as Upstash Redis, Supabase, or Giscus.

## Local dev

```bash
npm install
npm run dev
```
