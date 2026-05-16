# yzy-ovo personal wiki

A soft blue bilingual personal dashboard built with Next.js and Tailwind CSS.

## What changed in this version

- Dynamic greeting based on local visitor time.
- Fixed latest-post card layout to avoid overlap.
- Dark teal hover style for the left navigation.
- Added Bilibili and RedNote app-style icons.
- Added weather project link.
- Added a front-end like/comment demo using localStorage.

## Important note about likes and comments

The current like/comment widget stores data in the visitor's browser with localStorage. It is useful for UI testing, but it is not shared globally between visitors.

For real shared likes and public comments, connect a backend/database or use an external comment service such as GitHub Discussions with Giscus.
