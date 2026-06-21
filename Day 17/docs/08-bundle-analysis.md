# 08 — Bundle Analysis & Splitting Heavy Deps

**DevFeed goal:** the RSS parser and `marked` are large — keep them out of the
initial download and make them visible.

> The curriculum names webpack-bundle-analyzer; this is a Vite/Rollup project,
> so the equivalent is **rollup-plugin-visualizer**.

## What changed

- Added `rollup-plugin-visualizer`, gated behind `npm run analyze`
  (`ANALYZE=true vite build`), emitting an interactive treemap to
  `dist/stats.html`.
- Added `build.rollupOptions.output.manualChunks` to pin `marked` and
  `fast-xml-parser` into their own named vendor chunks.

## Measured result

| Chunk | Size | gzip | Loads when |
|-------|------|------|-----------|
| `marked-*.js` | ~41 kB | ~12 kB | you open an article |
| `xml-parser-*.js` | ~73 kB | ~26 kB | you open the RSS tab |
| `index-*.js` (entry) | — | — | up front (neither parser included) |

The two parsers together are ~115 kB raw — larger than the rest of the app.
Neither is in the initial bundle.

## What I learned

- **Code splitting already did the heavy lifting; manualChunks adds caching.**
  Because `marked`/`fast-xml-parser` were reachable only through dynamic imports
  (article route, RSS panel), Rollup had already kept them out of the entry
  chunk. `manualChunks` pins them to *stable, named* chunks so a hash change in
  app code doesn't bust the parser's cache entry, and vice-versa.
- **The treemap is the source of truth.** `stats.html` shows exactly which
  module pulled in what — invaluable for catching an accidental static import
  that drags a big dep into the entry chunk. Run it after any dependency change.
- **Don't analyze the dev build.** Only the production build reflects real
  tree-shaking, minification, and chunking.
- **`manualChunks` is a scalpel, not a default.** Over-splitting creates request
  waterfalls; the right targets are *large* deps with a *different change cadence*
  than your app code (parsers, charting, editors) — exactly `marked` and the XML
  parser here.
- **Verify, don't assume.** I confirmed with `npm run analyze` that the entry
  chunk doesn't contain either parser — easy to regress with a stray top-level
  import.
