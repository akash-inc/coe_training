# React Performance Exercises

This repo is a learning sandbox for React performance.
It has two parts:

- `/playground`: exercise-first lab (intentionally unoptimized baseline).
- `/dashboard-lab`: side-by-side unoptimized vs optimized demos.

If you are new to React, start with `/playground`. If you want instant visual
comparison, open `/dashboard-lab`.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown in terminal.

## Playground (`/playground`)

This page contains 10 guided exercises. Each exercise has a status badge:

- **Red**: not fixed yet.
- **Green**: fixed.

### Exercises in plain English

1. Record baseline performance in React DevTools Profiler.
2. Find biggest rerender bottlenecks.
3. Use `React.memo` to skip unnecessary rerenders.
4. Use `useMemo` for expensive derived values.
5. Use `useCallback` for stable handler references.
6. Lazy-load `/playground` route.
7. Lazy-load a heavy panel only when needed.
8. Virtualize long lists with `react-window`.
9. Add throttle + debounce to search filtering.
10. Move heavy computation to a Web Worker.

### Exercise 9 summary (throttle + debounce)

`usePlaygroundState` now uses both:

- `query` updates immediately while typing.
- Throttle limits how often `throttledQuery` updates.
- Debounce waits 300ms before committing to `debouncedQuery`.
- Filtering runs from `debouncedQuery`, so heavy filtering runs less often.
- `useEffect` schedules timers after render; it does not block rendering.

## Performance Playground (`/dashboard-lab`)

This page compares unoptimized and optimized behavior for 7 topics:

1. `React.memo`
2. `useMemo`
3. `useCallback`
4. Virtualization (`react-window`)
5. Debounce
6. Code splitting (`React.lazy` + `Suspense`)
7. Web Worker responsiveness

### Controls

- `Run Once`: triggers one stress cycle.
- `Start Stress Test`: starts repeated stress cycles.
- `Stop Stress Test`: stops repeated stress cycles.
- `Render Highlighter`: flashes components when they rerender.
- `CPU Throttling`: makes expensive work heavier to amplify differences.

### How to read top metrics quickly

- **Renders**: lower is better.
- **Avg Time (ms)**: lower is better.
- **CPU Estimate (%)**: relative workload indicator only.
- **FPS**: closer to 60 is usually smoother.
- **Status**: heuristic label from FPS and avg time.

### Demo-specific quick checks

- **React.memo**: optimized child should show fewer rerenders.
- **useMemo**: click `Change unrelated state`; unoptimized recomputes more.
- **useCallback**: type in input and watch `R:n` row counters.
  - `Ping` button means "invoke this row's click handler".
  - Compare row rerenders between left and right panes.
- **Virtualization**: optimized pane should render only visible rows.
- **Debounce**: optimized pane should fire fewer API calls while typing.
- **Code splitting**: optimized pane loads heavy module on demand.
- **Web Worker**: prioritize lower UI block lag over raw completion time.

## Practice flow

1. Profile before changes.
2. Make one targeted optimization.
3. Profile again.
4. Compare render counts and timings.
5. Mark status when verified.

## Notes

- This project intentionally includes both bad and good patterns for learning.
- Some metrics are heuristic and best used for relative comparison.

## Dependencies

- `react-router-dom`
- `react-window`
