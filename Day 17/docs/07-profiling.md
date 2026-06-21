# 07 — Performance Profiling & Re-render Fix

**DevFeed goal:** the feed list shouldn't re-render every existing card when a
new page of items is appended.

## What changed

- Added `RenderProfiler` (a dev-only wrapper over React's `<Profiler>`) around
  the feed list to log commit count + `actualDuration`.
- Wrapped `FeedCard` in `React.memo` and documented the intent.

## How to profile a production build

1. `npm run build && npm run preview` — profile the *production* bundle, not dev
   (dev has extra checks, double-invokes effects in StrictMode, and is far
   slower, so its numbers lie).
2. React DevTools → **Profiler** tab → record → scroll to trigger
   `fetchNextPage` → stop. Inspect the commit: the "Why did this render?" panel
   and the flamegraph show which components actually re-rendered.
   (DevTools profiles production builds; the React Compiler keeps component
   display names so the flamegraph stays readable.)
3. The `<Profiler>` `onRender` callback gives the same data programmatically.

## What I learned

- **The suspected bug — "every card re-renders on append" — is the classic
  unmemoized-list problem.** When the parent re-renders to show page N+1,
  `items.map(...)` re-creates the element list and, without memoization, every
  `FeedCard` re-renders even though only a handful are new.
- **Stable references are the prerequisite for `memo` to work.** React Query
  keeps previously-fetched page objects (and thus each `item`) referentially
  stable across `fetchNextPage`, so `memo`'s default shallow prop compare bails
  out existing cards. If I'd remapped items into fresh objects each render,
  `memo` would be useless.
- **React Compiler already does most of this.** With the compiler enabled, the
  mapped `<FeedCard item={item} />` elements are auto-memoized on `item`, so
  profiling showed existing cards *already* skipping re-render before I added
  `memo`. So the manual `memo` is **belt-and-suspenders**, not the fix — its real
  value is making the contract explicit and surviving a compiler-off build.
  Being honest: on this project the profiler delta from adding `memo` was ~nil.
- **Profile before optimizing.** The compiler changed where the wins are; the
  measurement is what tells you whether a `memo`/`useCallback` does anything at
  all. Adding them blindly is cargo-culting.
- **`key` must be stable and unique** (`item.id`) — an index key would defeat
  reconciliation and remount cards on every append.
