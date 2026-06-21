# 09 — Offline Support (Service Worker / PWA)

**DevFeed goal:** cache the app so it opens and reads offline.

## What changed

- Added `vite-plugin-pwa` (Workbox under the hood) with:
  - `registerType: 'autoUpdate'` + `injectRegister: 'auto'` — the SW registers
    itself and silently updates on new deploys, no manual `register()` code.
  - A web app manifest (name, theme, `devfeed.svg` icon) so DevFeed is
    installable.
  - `workbox.globPatterns` precaching every built chunk (~447 KiB, 21 entries).
  - `navigateFallback: '/index.html'` so offline deep links (`/article/...`)
    still boot the SPA.
- Added the icon + `theme-color` to `index.html`.

## What I learned

- **Precache vs runtime cache are different jobs.** This commit handles the
  **precache**: the build's static assets (the app shell) are stored at SW
  install, so the app *loads* with no network. It does **not** yet cache the API
  responses — that's runtime caching, in Commit 10. Loading offline and having
  *data* offline are separate problems.
- **Service workers are production-only here.** The SW isn't active in `npm run
  dev` (by design — it would cache stale assets mid-development). Test it with
  `npm run build && npm run preview`, then DevTools → Application → Service
  Workers, and toggle "Offline".
- **`navigateFallback` is the SPA's lifeline offline.** Without it, a hard
  refresh on `/article/x` offline would 404 — the SW intercepts the navigation
  and serves the cached `index.html` so the client router can take over.
- **`autoUpdate` trades a prompt for simplicity.** It swaps in the new SW as soon
  as it's ready. An alternative (`prompt`) shows a "new version available" toast;
  `autoUpdate` is fine for an app with no unsaved client state.
- **Precaching everything is reasonable at this size** but wouldn't scale to a
  huge app — you'd precache only the shell and runtime-cache the rest.
