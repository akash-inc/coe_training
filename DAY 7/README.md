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

## Tip: how to practice

1. Open React DevTools Profiler, record, and take a screenshot (**before**).
2. Fix one exercise.
3. Record again and take another screenshot (**after**).
4. Compare. The bars should get smaller.
5. Flip that exercise&apos;s red toggle to green.

## Dependencies already installed

- `react-router-dom` - for route lazy-loading practice (Exercise 6).
- `react-window` - for list virtualization practice (Exercise 8).
