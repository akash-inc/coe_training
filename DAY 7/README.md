# React Performance Exercises (Beginner Friendly)

This is a small React app that is written **badly on purpose**. Your job is
to practice making it faster, one small fix at a time.

If you are new to React: don&apos;t worry. Each exercise on the Playground page
explains in simple words what to learn and what to do.

## How to run it

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal and click **Open Playground**.

## Performance Playground (`/dashboard-lab`)

`/dashboard-lab` now hosts a side-by-side **unoptimized vs optimized** React
performance playground with 7 demos:

1. `React.memo`
2. `useMemo`
3. `useCallback`
4. Virtualization (`react-window`)
5. Debounce behavior
6. Code splitting (`React.lazy` + `Suspense`)
7. Web Worker responsiveness

### Metrics used and how to assess them

#### Shared top metrics panel

- **Renders**: total reported renders from all demo panes for each side.
  - Lower is generally better (fewer unnecessary updates).
- **Avg Time (ms)**: average of demo-reported operation times.
  - Lower means less work per interaction.
- **CPU Estimate (%)**: derived estimate from average time (not a real profiler CPU metric).
  - Use for relative comparison only.
- **FPS**: sampled frame rate via `requestAnimationFrame`.
  - Closer to 60 usually feels smooth.
- **Status (Janky / Mixed / Smooth)**: heuristic label from FPS + Avg Time thresholds.
  - Treat as quick signal, not scientific truth.

#### Per-demo metrics

- **React.memo demo**
  - Parent tick count, child render count, pane render/time summary.
  - Assess by checking optimized child render count stays much lower.
- **useMemo demo**
  - Compute time per pane (`Compute time: Xms`).
  - Assess by repeatedly changing unrelated state; optimized compute time should remain stable/lower frequency.
- **useCallback demo**
  - Per-row render badges (`R:n`) and pane render/time summary.
  - Assess by typing; unoptimized rows rerender more broadly than optimized rows.
- **Virtualization demo**
  - Items rendered count and pane render/time summary.
  - Assess by verifying optimized pane renders only visible window rows, not all list items.
- **Debounce demo**
  - API calls counter, loading indicator, last debounce+request delay.
  - Assess by typing quickly; optimized side should produce fewer calls and delayed dispatch behavior.
- **Code splitting demo**
  - Simulated initial/chunk size labels + lazy load time.
  - Assess by first-load behavior: optimized loads heavy module on demand.
- **Web Worker demo**
  - Completion time and **UI block lag** per pane.
  - Assess primarily with UI block lag/responsiveness, not just completion time.
  - Worker may have similar or slower completion due to messaging overhead, but should keep UI more responsive.

## The red / green toggle

On the Playground page, every exercise (1 to 10) has its own status button:

- **Red** = this exercise is still broken / slow (starting point).
- **Green** = a developer has fixed it.

Click an exercise&apos;s button when you finish fixing that specific exercise.
This is only a progress marker for practice.

## The 10 exercises in plain English

1. **See how slow it is.** Use React DevTools Profiler to record the app and
   look at the bars. Bigger bars = slower. In this app, the &quot;search box&quot;
   means the text input inside **Exercise 9**.
2. **Find the slowest parts.** The &quot;render counts&quot; panel tells you
   which components keep re-drawing. Pick the top 3.
3. **`React.memo`.** Tell React: &quot;if the inputs did not change, skip
   drawing this component again&quot;.
4. **`useMemo`.** Tell React: &quot;remember this heavy calculation; only redo
   it if the inputs change&quot;.
5. **`useCallback`.** Tell React: &quot;remember this function; don&apos;t
   create a brand new one every render&quot;.
6. **Lazy-load a route.** Don&apos;t download the Playground code until the
   user actually visits `/playground`.
7. **Lazy-load a heavy panel.** Don&apos;t load the Insights panel until it is
   really shown.
8. **Virtualize long lists.** Use `react-window` so the browser only draws the
   rows currently on screen instead of all 2400.
9. **Debounce / throttle typing.** Don&apos;t re-run the filter on every
   keystroke. Wait a moment, or limit how often it runs.
10. **Use a Web Worker.** Move really heavy math to a background thread so
    typing and clicking stay smooth.

## How we completed Exercise 9 (Throttle + Debounce)

We fixed Exercise 9 by adding both throttle and debounce in `usePlaygroundState`.

- `query` updates immediately while the user types.
- A throttle effect limits how often `throttledQuery` can update.
- A debounce effect then waits 300ms before updating `debouncedQuery`.
- If the user types again before 300ms, cleanup cancels the previous debounce timer.
- That state update triggers a new render.
- Filtering uses `debouncedQuery`, so `expensiveFilter(...)` runs less often.

### Important behavior

- `useEffect` does not block rendering.
- Render completes first, then the timer callback runs later.
- Throttle runs when `query` changes; debounce runs when `throttledQuery` changes.
- Updating `debouncedQuery` causes re-render, but does not re-run throttle unless `query` changes.

## Exercise completion summary

Current status based on code in this project (not all are fully completed):

- [ ] **Exercise 1 (Profiler setup)** - Manual task. Instructions are present, but recording and saving profiler evidence is still pending.
- [ ] **Exercise 2 (Bottlenecks)** - Render-count panel exists, but identifying and documenting top 3 bottlenecks is still pending.
- [x] **Exercise 3 (`React.memo`)** - `ActionPanel` is wrapped in `React.memo`.
- [x] **Exercise 4 (`useMemo`)** - `StatsPanel` memoizes derived hot/cold counts from `items`.
- [x] **Exercise 5 (`useCallback`)** - High-churn handlers are stabilized with `useCallback` in hooks/components.
- [x] **Exercise 6 (Route lazy loading)** - `/playground` route is loaded with `React.lazy` + `Suspense`.
- [ ] **Exercise 7 (Component lazy loading)** - `InsightsPanel` is still directly imported/rendered (not lazy-loaded yet).
- [x] **Exercise 8 (List virtualization)** - `LargeListPanel` uses `react-window` `List`.
- [x] **Exercise 9 (Debounce/throttle input)** - Search input now applies throttle + debounce before expensive filtering.
- [x] **Exercise 10 (Web Worker)** - Heavy average-score calculation runs in `analysis.worker.js`.

### What we implemented in code

- Added route-level code splitting for Playground via lazy route loading.
- Optimized rerender churn using `React.memo` and `useCallback`.
- Added memoization of derived stats in `StatsPanel`.
- Implemented long-list virtualization with `react-window`.
- Added both throttle and debounce in `usePlaygroundState` for the search flow.
- Moved CPU-heavy score averaging to a Web Worker and wired request/response handling.

## Tip: how to practice

1. Open React DevTools Profiler, record, and take a screenshot (**before**).
2. Fix one exercise.
3. Record again and take another screenshot (**after**).
4. Compare. The bars should get smaller.
5. Flip that exercise&apos;s red toggle to green.

## Dependencies already installed

- `react-router-dom` - for route lazy-loading practice (Exercise 6).
- `react-window` - for list virtualization practice (Exercise 8).
