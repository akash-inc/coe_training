# 01 — Code Splitting & Lazy Loading

**DevFeed goal:** a separate chunk per source (HN / GitHub / RSS), and panels
deferred until their tab is active.

## What changed

`FeedPage` now imports the panels with `React.lazy(() => import(...))` instead
of static `import` statements. A dynamic `import()` is a signal to the bundler:
Vite/Rollup splits each panel into its own chunk. `<Suspense>` wraps the active
panel so React can show a fallback while the chunk downloads.

```js
const HNPanel = lazy(() => import('../panels/HNPanel'))
```

## What I learned

- **`React.lazy` + dynamic `import()` is the whole mechanism.** No bundler
  config needed — the dynamic import *is* the split point. The static import
  graph stays in the main bundle; everything reachable only through a dynamic
  import becomes a separate chunk.
- **Code splitting vs lazy loading are two different wins from one change.**
  Splitting = smaller initial bundle. Lazy loading = the GitHub/RSS chunks (and
  their transitive deps like the RSS parser) aren't even *requested* until you
  open that tab. Verify in the Network panel: `RSSPanel-*.js` loads only on click.
- **Suspense is mandatory for `lazy`.** Without an enclosing `<Suspense>`, a
  lazy component throws during render. The fallback is what the user sees during
  the chunk fetch — keep it lightweight.
- **Before/after:** baseline was one ~305 kB JS file. After splitting, the
  initial bundle drops and each panel ships independently — confirmed in the
  `vite build` chunk listing (now multiple `*Panel-*.js` files).
- **Granularity is a judgment call.** Splitting per-route or per-heavy-feature
  pays off; over-splitting tiny components just adds request waterfalls.
