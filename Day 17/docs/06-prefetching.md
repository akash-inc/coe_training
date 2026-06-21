# 06 — Prefetching & Background Refetching

**DevFeed goal:** prefetch an article on hover so the click feels instant.

## What changed

- Added `usePrefetchArticle`, which calls `queryClient.prefetchQuery` into the
  exact key the article page reads (`['article', source, id]`).
- `FeedCard` fires it on `onMouseEnter` / `onFocus`.
- Extracted a shared `loadArticle` so the prefetch and the page produce the same
  cached shape. The page applies `marked` at render; the cache stores raw
  markdown/HTML.

## What I learned

- **Prefetch = move the fetch earlier in time, into idle attention.** The ~200ms
  between hover and click is enough to fetch a README, so navigation lands on a
  warm cache and renders synchronously.
- **The cache key is the contract.** Prefetch only helps if it writes the *same*
  `queryKey` the destination reads. I deliberately routed both through
  `articleKey()` to guarantee the hit.
- **`staleTime` decides whether prefetch "sticks."** With `staleTime: 0`, the
  page would refetch immediately on navigation and the prefetch would be wasted.
  A 5-minute `staleTime` keeps the prefetched data fresh through the click.
- **Prefetch must stay cheap to import.** Hover handlers live in `FeedCard`
  (shared chunk), so `loadArticle` uses **dynamic imports** for the fetchers —
  hovering an HN card never pulls in the RSS parser, and `marked` stays in the
  article route chunk.
- **Background refetching is the other half of freshness.** When cached data
  goes stale, React Query silently refetches on the next mount/focus while still
  showing the cached copy — the user sees instant content that quietly updates.
  This is the stale-while-revalidate behavior formalized in Commit 10.
- **`prefetchQuery` is self-throttling** — it short-circuits when data is already
  fresh, so spamming hover events costs nothing.
