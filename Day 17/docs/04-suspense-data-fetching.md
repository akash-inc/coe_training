# 04 — Suspense for Data Fetching

**DevFeed goal:** skeleton cards while feeds load, with no hand-written
loading/error branches.

## What changed

- Panels switched from `useQuery` (with `isPending`/`throwOnError`) to
  `useSuspenseQuery`. The component now reads `data` directly — it can't render
  until data exists.
- Added `SkeletonCard` / `SkeletonList` and used it as the `<Suspense>`
  fallback in `FeedPage`.

## What I learned

- **`useSuspenseQuery` inverts control.** Loading is delegated *up* to the
  nearest `<Suspense>` and errors *up* to the nearest error boundary. The
  component body only ever deals with the success case — `data` is guaranteed
  non-undefined, which also removes a whole class of "data might be loading"
  null checks.
- **Suspense + error boundary are a pair.** Commit 3's boundaries now do double
  duty: they catch the errors `useSuspenseQuery` throws. This is the canonical
  production layout — a Suspense fallback for the pending state and an error
  boundary for the failure state, wrapping the same subtree.
- **One Suspense boundary, two responsibilities.** Here the same boundary
  covers the lazy *chunk* download and the suspense *query*. Users see skeletons
  for both; functionally they're distinct suspensions React coalesces.
- **Parallelism is automatic.** Sibling suspense queries under one boundary
  fetch concurrently and the boundary reveals when all resolve. Skeletons are
  what makes that wait feel intentional instead of broken.
- **Skeletons should mirror real layout** (card shape, line widths) to avoid a
  jarring shift when content swaps in; respect `prefers-reduced-motion`.
