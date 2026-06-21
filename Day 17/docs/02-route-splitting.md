# 02 — Route-Based Code Splitting

**DevFeed goal:** add an article detail page (`/article/:source/:id`) and split
the app by route, so the heavy markdown renderer (`marked`) only loads when you
actually open an article.

## What changed

- Added `react-router-dom` with `createBrowserRouter`. Two routes: `/` (feed)
  and `/article/:source/:id` (detail).
- Both page components are `React.lazy`, wrapped in `<Suspense>` — the same
  mechanism as Commit 1, now applied at the route level.
- `ArticlePage` imports `marked` and renders GitHub READMEs (real markdown),
  RSS content, or HN text. `marked` therefore lands in the *article* chunk.
- `FeedCard` titles became `<Link>`s into the article route.

## What I learned

- **Routes are the most natural split boundary.** A user on the feed rarely
  needs the article renderer immediately, so deferring `marked` (a sizable dep)
  behind the article route is a clean, high-value split — no code change to
  `marked` usage, just where it's reachable from.
- **`lazy` composes across levels.** The feed route lazy-loads, and *within* it
  the panels lazy-load too. React resolves nested Suspense boundaries
  independently, so each shows its own fallback.
- **Client routing needs an SPA fallback.** `createBrowserRouter` uses the
  History API; deep links like `/article/...` only work because Vite's dev
  server and `vite preview` rewrite unknown paths to `index.html`. A real host
  needs the same rewrite rule.
- **URL-encode ids with slashes.** GitHub `owner/repo` ids break path matching,
  so cards `encodeURIComponent` the id and the page `decodeURIComponent`s it.
- **`marked` output is raw HTML** → it needs `dangerouslySetInnerHTML`, which is
  an XSS surface. Noted in code that production should run it through DOMPurify.
