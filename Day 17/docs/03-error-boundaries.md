# 03 — Comprehensive Error Boundaries

**DevFeed goal:** one feed failing (e.g. GitHub's 60/hr rate limit) must not
break the others.

## What changed

- Added `FeedErrorFallback` and wrapped the active panel in an `ErrorBoundary`
  (`react-error-boundary`), keyed by the active tab so switching clears a stale
  error.
- Wrapped that boundary in React Query's `QueryErrorResetBoundary`; the fallback's
  **Retry** calls `resetErrorBoundary`, which fires `onReset → reset()` and
  re-runs the failed query.
- Panels switched to `throwOnError: true`, so query failures propagate to the
  boundary instead of each panel hand-rolling its own error branch.

## What I learned

- **Error boundaries only catch render-phase errors.** A rejected fetch inside
  an event handler or a bare promise won't reach them — that's exactly why
  `throwOnError: true` matters: it makes React Query *re-throw during render* so
  the boundary sees it.
- **Isolation comes from boundary placement.** One boundary at the app root
  would blank the whole UI on any failure. A boundary *per panel* contains the
  blast radius to a single tab — the production "Suspense + error boundary"
  pattern is fundamentally about where you draw these boundaries.
- **`QueryErrorResetBoundary` is the missing link for recovery.** Without it,
  Retry would reset the React tree but React Query would hand back the same
  cached error. Pairing them makes Retry actually re-fetch.
- **`resetKeys` prevents sticky errors.** Without `resetKeys={[active]}`, a
  failure on the GitHub tab would persist visually after switching tabs.
- **GitHub rate-limiting is a free live demo:** hammer refresh, hit a 403, and
  watch only the GitHub tab show the fallback while HN and RSS keep working.
