# 05 — Infinite Scroll (cursor-based)

**DevFeed goal:** `useInfiniteQuery` per feed, cursor-based, auto-loading the
next page as you scroll.

## What changed

- Added `useInfiniteFeed`, a generic wrapper over `useSuspenseInfiniteQuery`
  that flattens `data.pages` and wires an `IntersectionObserver` sentinel to
  `fetchNextPage`.
- Each panel supplies its own `queryFn` / `getNextPageParam` so the three
  pagination styles coexist:
  - **HN** — 0-based `page`, stop at `nbPages`.
  - **GitHub** — 1-based `page`, stop when `hasMore` is false (API caps at 1000).
  - **RSS** — `cursor` = item offset into the parsed feed; `nextCursor` is
    `undefined` at the end.
- `FeedList` renders the flattened items plus the sentinel element.

## What I learned

- **`getNextPageParam` returning `undefined` is the "done" signal** — it's what
  flips `hasNextPage` to false. Each source computes it differently, but the
  contract is identical, which is why one hook serves all three.
- **"Cursor-based" generalizes page numbers.** A page index, a `?cursor=` token,
  and a client-side offset are all just opaque "where to resume" values. Modeling
  RSS's client-side slice as a cursor made it drop into the same hook with zero
  special-casing in the UI.
- **IntersectionObserver beats scroll listeners** — no throttling, fires off the
  main thread, and `rootMargin: '300px'` prefetches the next page *before* the
  user hits the bottom so scrolling feels seamless.
- **`fetchNextPage` is idempotent while fetching**, so the observer can fire
  repeatedly without guards — React Query coalesces the calls.
- **Suspense + infinite query interplay:** `useSuspenseInfiniteQuery` only
  suspends on the *first* page. Subsequent pages show an inline "Loading more…"
  via `isFetchingNextPage`, not the skeleton fallback — exactly what you want.
- **Keeping the hook API-agnostic preserved code splitting:** importing the
  fetchers in each panel (not in the shared hook) keeps `fast-xml-parser` out of
  the HN/GitHub chunks.
