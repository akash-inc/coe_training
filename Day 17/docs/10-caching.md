# 10 — Caching Strategies for Production

**DevFeed goal:** stale-while-revalidate for feed items; cache articles for
offline reading.

## What changed

- Added Workbox `runtimeCaching` to the PWA config:
  - **`devfeed-feeds` → StaleWhileRevalidate** for HN/GitHub search + the RSS
    proxy. Serve cached instantly, refresh in the background.
  - **`devfeed-articles` → CacheFirst** for READMEs and HN item text. Serve from
    cache with no network when present (offline reading), expire after a week.
- Aligned React Query defaults (`queryClient.js`): `staleTime` 1 min, `gcTime`
  24 h, `refetchOnReconnect: true`.

## What I learned

- **There are two caches, and they do the same thing at different layers.**
  React Query is the *in-memory, in-session* SWR cache (instant tab switches,
  background refetch). The Workbox runtime cache is the *on-disk, cross-session*
  one (survives reload, works offline). Tuning only one leaves a gap — e.g.
  React Query alone forgets everything on refresh.
- **Strategy follows data volatility:**
  - *Stale-while-revalidate* fits feeds — being a few seconds stale is fine, and
    showing something instantly while revalidating is the best perceived perf.
  - *Cache-first* fits article bodies — a README rarely changes within a session,
    so skipping the network entirely is the win and the offline enabler.
  - (*Network-first* would suit must-be-fresh data like a checkout total — not
    present here, but it's the third common shape.)
- **`cacheableResponse.statuses: [0, 200]`** — the `0` matters: opaque
  cross-origin responses (the GitHub/HN APIs, the RSS proxy) report status `0`,
  and without it Workbox would refuse to cache them.
- **Route order is first-match-wins.** Feed and article URL patterns are disjoint
  here (`/search` vs `/repos`, `/items`), so ordering is safe — but overlapping
  patterns would silently take the first registered handler.
- **`staleTime` vs `gcTime` are distinct knobs.** `staleTime` controls *when to
  revalidate*; `gcTime` controls *how long unused data lingers*. A long `gcTime`
  with a short `staleTime` is the SWR sweet spot: instant revisits that quietly
  refresh.

## Verifying offline
`npm run build && npm run preview`, browse a few feeds + open an article to warm
the caches, then DevTools → Application → toggle **Offline** and reload — the
shell, the visited feeds, and the opened articles all still render.
