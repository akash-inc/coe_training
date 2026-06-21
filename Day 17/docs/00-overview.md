# 00 — DevFeed Overview

DevFeed is a developer feed aggregator that pulls from three sources — **Hacker
News**, **GitHub**, and **RSS** — into one tabbed reader. It exists as a
practice vehicle for production React performance patterns; each subsequent
commit applies one pattern end-to-end and documents what it taught.

## Why these three sources

Each source exercises a different real-world wrinkle:

| Source | API | Wrinkle it surfaces |
|--------|-----|---------------------|
| Hacker News | Algolia (`hn.algolia.com`) | Clean page-based pagination, CORS-friendly |
| GitHub | Search + README API | Strict rate limits (60/hr unauth) → great for error-isolation demos |
| RSS | CSS-Tricks feed via CORS proxy | No CORS headers; XML parsing; finite feed → client-side cursor |

All three normalize to one item shape (`{ id, source, title, url, points, author, time, summary }`)
so the card and list code stays source-agnostic.

## Baseline state (this commit)

- React Query (`QueryClientProvider`) with a shared `queryClient`.
- Three panels (`HNPanel`, `GitHubPanel`, `RSSPanel`) each fetch their first
  page with a plain `useQuery` and render manual loading/error states.
- **Everything is imported eagerly** and lands in the main bundle. This is the
  intentional "before" — the next commits split, defer, suspend, and cache it.

## React Server Components — awareness note

RSC is **awareness-only** for this project; DevFeed stays a client-rendered
Vite SPA. The relevant mental model:

- **RSCs run only on the server** and send a serialized component tree (not JS)
  to the client. They can read data sources directly (`await db.query(...)`)
  with **zero client bundle cost** — a component that imports `marked` or an RSS
  parser would ship *none* of that to the browser.
- They need a server runtime + framework integration (Next.js App Router, or a
  Vite RSC setup). Plain Vite SPAs render entirely on the client, so we don't
  have them here.
- **Where RSC would change DevFeed:** the feed fetching and markdown rendering
  (`marked`) could move server-side, shrinking the client bundle and removing
  the CORS-proxy hop for RSS. Several optimizations in this series (code
  splitting heavy parsers, bundle analysis) are precisely the problems RSC
  solves structurally — worth recognizing the overlap.
- **Client Components** (`'use client'`) remain necessary for interactivity:
  tab state, infinite-scroll observers, hover prefetch. So even an RSC version
  of DevFeed would be a hybrid.

We implement the client-side patterns here because they apply to *any* React
app today, RSC or not.
