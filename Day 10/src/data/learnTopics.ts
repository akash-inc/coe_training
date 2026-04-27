/**
 * One entry per /learn/:slug page. `focus` drives [data-demo-focus] for visual callouts in App.css
 */
export type DemoFocus =
  | 'header'
  | 'list'
  | 'detail'
  | 'cache'
  | 'banner'
  | 'optimistic'
  | 'prefetch'
  | 'background-refetch'
  | 'all'
  | 'none'

export type LearnTopic = {
  slug: string
  title: string
  /** Short blurb for hub cards */
  summaryPlain: string
  /** Shown in the callout strip under the titles */
  callout: string
  /** Step-by-step or concepts; file names as plain text */
  bodyTechnical: string
  /** Non-technical audience */
  bodyPlain: string
  /** Opening line for the hands-on section */
  tryItIntro: string
  /** Ordered steps: what to do, what to expect, why (see Try it on each page) */
  tryItSteps: string[]
  focus: DemoFocus
}

export const learnTopics: LearnTopic[] = [
  {
    slug: 'parallel-queries',
    title: 'Parallel queries (useQueries)',
    summaryPlain:
      'The header loads your profile, workspace name, and rolling task counts at the same time—not one after another.',
    callout:
      'Focus: the header. Three separate queries share one strip; each has its own cache entry.',
    bodyTechnical: `WorkspaceHeader uses useQueries from @tanstack/react-query with three option objects from lib/queryOptions.ts: userMe(), workspaceSummary(), and workspaceStats(). Each query has its own queryKey (userKeys.me, workspaceKeys.summary, workspaceKeys.stats) so React Query can refetch or invalidate them independently.

The hook waits until all three finish before the header leaves its loading state (you could instead render each sub-result as it arrives by branching on each result status). workspaceStats() sets refetchInterval and staleTime so counts can refresh in the background—that behavior is shared with the background-refetch topic.

Files: src/components/WorkspaceHeader.tsx, src/lib/queryOptions.ts, src/lib/queryKeys.ts.`,
    bodyPlain: `Imagine three quick errands: check who is logged in, confirm which workspace you are in, and read three counters. You can phone three people at once instead of waiting for each call to end before starting the next. That is what parallel queries do: independent questions, one round trip each, overlapping in time.

You still get one composed header in the UI, but under the hood the cache keeps three separate answers so one can refresh without throwing away the others.`,
    tryItIntro:
      'Use the browser Network tab (dev) and React Query Devtools together. You are looking for three concurrent fetches and three distinct cache keys for the top strip.',
    tryItSteps: [
      'Reload the page or open this topic from the hub. Do: watch the header while it first loads. Expect: a short “loading” feel, then your name, workspace name, and three stat chips (open / in progress / done) all appear together. Why: all three useQueries were in flight in parallel, not sequenced by one await chain.',
      'Do: in Network, filter to fetch/XHR and look at the first wave of requests after load. Expect: you should see multiple requests (profile, workspace summary, stats) starting at nearly the same time, not one completing before the next begins. Why: the browser issues them in parallel; React Query does not block one query on another when they are independent.',
      'Do: open React Query Devtools and find keys like user, workspace summary, and workspace stats. Expect: separate entries, each with its own data and status. Why: scoping by queryKey is what lets the library invalidate or refetch one slice without clearing the rest of the header.',
    ],
    focus: 'header',
  },
  {
    slug: 'infinite-list',
    title: 'Infinite list (useInfiniteQuery)',
    summaryPlain:
      'The task list loads one page of rows first; “Load more” appends the next page to the same infinite query cache.',
    callout: 'Focus: the task list. Extra pages are appended, not a full reload of the whole list key.',
    bodyTechnical: `TaskListInfinite uses useInfiniteQuery with options from tasksInfinite() in lib/queryOptions.ts. The key is taskKeys.infinite(pageSize, workspaceId) so pagination is scoped to this workspace and page size. The server returns { items, nextCursor }; getNextPageParam returns the next offset for Supabase or null when there is no more data.

The UI flattens pages with flatMap and renders a single list. “Load more” calls fetchNextPage, which appends a new page object to the infinite cache shape rather than replacing page 0.

Files: src/features/tasks/TaskListInfinite.tsx, src/lib/queryOptions.ts, listTasksPage in api/unified.ts + Supabase .range in rq10Api.ts.`,
    bodyPlain: `Instead of downloading every task in the database on first paint, the app requests a small batch, shows it, and only asks for the next batch when you ask for it—like reading a long article one screen at a time.

That keeps the first interaction fast and still lets you work through a long list without holding everything in memory at once.`,
    tryItIntro:
      'The infinite query keeps an array of “pages” in the cache. You will add a page and see the Devtools entry grow, not reset to a single flat list from scratch.',
    tryItSteps: [
      'Do: look at the task list on first load. Expect: a first set of tasks (up to the page size) and a “Load more” control if the server has more rows. Why: the first page is one “page” object inside the infinite query’s cache.',
      'Do: click “Load more” once. Expect: more rows appear below the first batch; the first batch does not disappear. Why: useInfiniteQuery appends the next page; previous pages stay in the cache for this query key.',
      'Do: open Devtools, select the task list (infinite) query, and inspect data after one or more “Load more” clicks. Expect: a pages array (or equivalent) with multiple entries, each with items. Why: the mental model is “list of pages,” not one giant array the server must return in one go.',
    ],
    focus: 'list',
  },
  {
    slug: 'dependent-queries',
    title: 'Dependent queries (comments after task)',
    summaryPlain:
      'Comments are fetched only after the task for this route is loaded successfully—no request with a half-known id.',
    callout: 'Focus: the detail column. The comments query is disabled until the task query succeeds.',
    bodyTechnical: `In TaskDetailBoundary, the task query uses taskDetail(taskId) from queryOptions. The comments query uses taskComments(taskId) with enabled: tq.isSuccess, where tq is the task useQuery result. Until the task resolves successfully, the comments query is disabled, so it does not hit the network with a task id you do not yet trust.

If the task is loading, you see a loading state; once data exists, the comments query runs. The comments key is taskKeys.comments(taskId) per workspace, so it invalidates separately from the task list.

Files: src/features/tasks/TaskDetailBoundary.tsx, taskComments in lib/queryOptions.ts, getTaskComments in api/unified.ts and rq10Api.ts.`,
    bodyPlain: `You would not ask for “all notes for this task” before you know which task is open. The UI loads the main record first, then—only when that succeeded—it loads the related thread.

If you switch tasks, the same pattern repeats: new task id, new detail fetch, then new comments when that detail is good.`,
    tryItIntro:
      'You will read the same route twice in order: first the task, then the comments, both tied to the task id in the URL.',
    tryItSteps: [
      'Do: with no task selected, pick one from the list. Expect: “Loading task…” first, then the title and status; only after that, “Loading comments…” may appear, then the comment list. Why: the comments query is enabled only when the task query has succeeded (enabled: tq.isSuccess).',
      'Do: open Dev Network (or Devtools query order). Expect: a request (or resolution) for the task before a request for comments for that id. Why: the child query should not run until the parent has a confirmed id and successful task row.',
      'Do: select a different task from the list. Expect: the detail panel fetches the new task; comments update to match the new id. Why: the dependent pattern runs again for the new key—comments are always tied to the open task, not a stale one.',
    ],
    focus: 'detail',
  },
  {
    slug: 'optimistic-mutations',
    title: 'Optimistic updates and rollback',
    summaryPlain:
      'Cycling status updates the card immediately, then the app PATCHes; if the write fails, the cache rolls back and you see a global error.',
    callout:
      'Focus: Cycle status. Use “Fail writes while enabled” in Cache & debug to force a failed PATCH without changing server data.',
    bodyTechnical: `usePatchTask in features/tasks/usePatchTask.ts implements an optimistic update: onMutate cancels in-flight task queries, snapshots the previous task detail and infinite list data (cloned), applies setQueryData to the cycled status, then calls patchTaskRemote. On error, the snapshot is written back; on success, onSettled invalidates the task scope and workspace stats so the UI converges with the server.

Simulated write failures are handled in lib/simulateWriteFailure.ts and checked in createTask and patch in api/unified.ts; “Fail writes while enabled” in CacheToolsPanel sets the flag so every write throws until you turn it off.

Files: usePatchTask.ts, simulateWriteFailure.ts, api/unified.ts, CacheToolsPanel.tsx.`,
    bodyPlain: `The app changes what you see right away so the UI feels snappy. The network call still runs; if the server rejects the change, the previous values are put back, like undo. A banner at the top can tell you something went wrong without you hunting in the console.

That is the bargain of optimistic updates: better perceived speed, with explicit recovery when the server disagrees.`,
    tryItIntro:
      'You will compare a successful cycle with a forced failure, using the same button and the cache debug toggle.',
    tryItSteps: [
      'Do: open a task, ensure “Fail writes while enabled” is off, and click “Cycle status.” Expect: the status in the detail panel updates right away, then stays consistent after a moment (and list stats may update after revalidation). Why: the mutation applies optimistic setQueryData first, then the server patch succeeds.',
      'Do: turn on “Fail writes while enabled” in Cache & debug, then click “Cycle status” again. Expect: a brief optimistic flip, then the old status returns and a red-tinted error banner appears at the top. Why: the thrown error triggers onError rollback in usePatchTask and the global mutation onError in queryClient still surfaces the message.',
      'Do: turn “Fail writes while enabled” off and click “Cycle status” again. Expect: a normal successful cycle and no error banner. Why: the same mutation path, without the simulate flag, reaches Supabase and onSettled can invalidate to match the server.',
    ],
    focus: 'optimistic',
  },
  {
    slug: 'prefetching',
    title: 'Prefetch on hover (prefetchQuery)',
    summaryPlain:
      'Resting the pointer on a task row can warm the detail query in the cache before you click, so open feels instant.',
    callout: 'Focus: the list. Hover a row to prefetch; open the task to use the warmed cache. Comments still load after open.',
    bodyTechnical: `In TaskListInfinite, each task link’s onMouseEnter calls queryClient.prefetchQuery with the same options as taskDetail(id) from queryOptions, so the detail query can enter the cache with the same key and staleTime as a normal read. Prefetch does not start the comments query: those stay dependent on tq.isSuccess in TaskDetailBoundary after navigation.

File: src/features/tasks/TaskListInfinite.tsx (prefetch), lib/queryOptions.ts (taskDetail).`,
    bodyPlain: `If you are pretty sure the user will open an item, you can load that item’s data a moment early—when the mouse rests on the row—so the next click is mostly a cache hit. You still only load “extra” data that depends on the open record (like comments) after you are sure which record is open.

It is a small UX win that adds a little background traffic when hover is used.`,
    tryItIntro:
      'You will separate “prefetch detail” (hover) from “load comments” (after open). Network or Devtools makes the sequence visible.',
    tryItSteps: [
      'Do: move the pointer over a task row and pause, but do not click yet. Expect: a lightweight detail fetch may start (visible in Network as activity for the task) even before the click. Why: onMouseEnter triggers prefetchQuery for that task’s detail key.',
      'Do: after hovering, click the same row. Expect: the detail view often populates very quickly if prefetch filled the cache. Why: the detail useQuery can read the prefetched data first; comments may still show “Loading comments…” after the task is ready, because they are a separate, dependent query.',
      'Do: open a task without hovering its row first (click from a cold row). Compare how snappy the detail feels versus the hover-then-open path. Why: the comparison shows when prefetch had a chance to hide network latency for the first paint of the detail field.',
    ],
    focus: 'prefetch',
  },
  {
    slug: 'cache-invalidation',
    title: 'Cache keys and invalidation',
    summaryPlain:
      'Task data is named with hierarchical keys and workspace scope so you can invalidate a whole family of queries or a custom subset with a predicate.',
    callout: 'Focus: Cache & debug. Buttons map to invalidateQueries, resetQueries, and setQueryData on real keys.',
    bodyTechnical: `All task keys live in lib/queryKeys.ts, shaped like ['tasks', workspaceId, …, detail|infinite|comments, …]. The workspace id in the key lets predicates target only this tenant’s rows.

“Invalidate tasks prefix” calls invalidateQueries({ queryKey: taskKeys.all() }), which matches every task-related query in this workspace that shares that prefix, so list, detail, and comments entries go stale and refetch if they are currently observed.

“Predicate: this workspace” uses a custom predicate on the query cache to match keys where the first segment is 'tasks' and the second is the current workspace id—useful when you want logic that is awkward to express as a single static prefix.

“Reset infinite list” uses resetQueries on the infinite key: it clears paged data and the infinite query’s internal page history, not just a stale mark.

setQueryData on the first list item rewrites the in-memory result only: the UI can show a new title with no request until you invalidate and refetch.

“Invalidate workspace stats” hits workspaceKeys.stats, a different branch from taskKeys, so you can see scoped invalidation for header counts.

Files: lib/queryKeys.ts, src/components/CacheToolsPanel.tsx, createQueryClient in lib/queryClient.ts for default refetch behavior.`,
    bodyPlain: `Think of the cache as a set of labeled drawers. Prefix invalidation means “throw out anything whose label starts with tasks for this workspace.” A predicate is a custom rule, like “only drawers where the second label part matches my workspace id.”

Reset is stronger than mark-stale: for infinite data it can throw away the remembered pages. setQueryData is you editing a sticky note the UI reads until the next real fetch overwrites it.`,
    tryItIntro:
      'Use React Query Devtools to watch query entries change as you press each control. Keep a task and the list on screen so you can see list and header react.',
    tryItSteps: [
      'Do: open Devtools and find keys under tasks (infinite, maybe detail, comments if you opened a task). Note their state, then click “Invalidate tasks prefix.” Expect: active queries refetch; list and open detail should align with the server again. Why: invalidation marks matching queries stale and triggers refetch for what is on screen.',
      'Do: click “Predicate: this workspace.” Expect: similar refetch for task queries scoped to this workspace. Why: same goal as prefix invalidation, but the plan shows how a predicate can express custom key matching in code.',
      'Do: load two pages with “Load more,” then click “Reset infinite list.” Expect: the infinite query’s cached pages are cleared; the list returns toward a first-page view and may refetch. Why: reset drops cached page history, not only staleness metadata.',
      'Do: click “setQueryData first title.” Expect: the first task’s title in the list changes immediately, with no network (check Network) until you refetch. Why: setQueryData is a local patch of the query result, useful for quick experiments, not a substitute for the server as source of truth.',
      'Do: click “Invalidate workspace stats” in the footer. Expect: the open / in progress / done chips in the header refetch. Why: that button targets workspaceKeys.stats, separate from the tasks tree, so you see narrow invalidation.',
    ],
    focus: 'cache',
  },
  {
    slug: 'global-errors',
    title: 'Global error handling (Query + Mutation cache)',
    summaryPlain:
      'Query and mutation failures can bubble to a small global log so one dismissible banner can show the last API error, without wiring every hook.',
    callout: 'Focus: the top error banner. Trigger a failed write (or query error) and dismiss the banner to clear the last message.',
    bodyTechnical: `lib/queryClient.ts passes onError handlers to QueryCache and MutationCache. Those call apiErrorBus.emit from errorBus.ts. ApiErrorLogProvider subscribes, keeps the latest error, and GlobalErrorBanner renders it. Anything that throws or rejects through those caches can surface the same way, including simulated write failures in api/unified.ts.

The banner is a cross-cutting UI; it does not replace per-query error UI when you want it (for example, comments in TaskDetail still show an inline error when the comments query errors).

Files: queryClient.ts, errorBus.ts, ApiErrorLogContext.tsx, GlobalErrorBanner.tsx, unified.ts (maybeThrowSimulatedWrite).`,
    bodyPlain: `When a background read or write fails, you do not have to add a new error state to every screen. A single pipeline can post the last failure to one place, and a banner can tell a human in plain language while you fix or retry.

Dismissing the banner only hides the last message; the next error can post again the same way.`,
    tryItIntro:
      'You will use the same simulated failure as the optimistic topic, but read the result through the “global” lens: the banner, not the detail fields alone.',
    tryItSteps: [
      'Do: with a task open, turn on “Fail writes while enabled” in Cache & debug, then click “Cycle status.” Expect: rollback in the list/detail as in the optimistic topic, and a top banner with a message about the failed write. Why: the mutation’s error also flows through the MutationCache onError into the bus and banner.',
      'Do: read the banner text, then click “Dismiss.” Expect: the banner clears, but the underlying query cache behavior is unchanged. Why: the global UI is a log of the last error for visibility, not a second source of truth for data.',
      'Do: turn off “Fail writes while enabled” and perform a successful “Cycle status.” Expect: no new error banner for that action. Why: a successful mutation does not go through the error path; only failures feed the bus for that pattern.',
    ],
    focus: 'banner',
  },
  {
    slug: 'error-boundaries',
    title: 'Error boundaries and throwOnError',
    summaryPlain:
      'The detail useQuery is configured to throw to React when loading a task fails, so a local error boundary can show retry without crashing the full page.',
    callout: 'Focus: the detail panel. Use a task id that does not exist in the database to see the boundary fallback.',
    bodyTechnical: `TaskDetailInner spreads taskDetail(id) with throwOnError: true. If getTask in api/unified → getTaskSupabase cannot find a row, it throws ApiError with 404, which becomes a query error and then propagates to QueryErrorBoundary as a throw from the observer.

The boundary’s fallback shows the message and a “Retry” button; onReset calls resetQueries for taskKeys.detail(taskId). The global query/mutation onError in queryClient can still run; the boundary is for rendering a controlled subtree on exceptional failures, not for every empty or soft failure.

Global errors can still be logged if they also go through the cache’s onError, but the primary UX for a missing task here is the inline boundary.

Files: TaskDetailBoundary.tsx, QueryErrorBoundary.tsx, rq10Api.ts getTaskSupabase (throws when !data), queryClient.ts.`,
    bodyPlain: `Sometimes one piece of the screen is broken—a bad id, a hard server error—while the rest of the app is fine. A boundary is a small fence: inside it you show “could not load this part” and a way to try again, instead of a blank or a whole-app crash.

That is different from a banner about a background mutation, which is about a side effect, not the main read failing for this view.`,
    tryItIntro:
      'The API returns 404 and throws for a real UUID with no row. You will use the all-zero placeholder id so you do not depend on a specific seed id.',
    tryItSteps: [
      'Do: while on any learn page with slug in the URL, set the path to a non-existent task, for example: /learn/error-boundaries/tasks/00000000-0000-4000-8000-000000000000 (valid UUID, no task row). Expect: the detail panel shows “Couldn’t load this task” and a “Retry” button, not a silent empty panel. Why: getTask throws when no row, throwOnError lets the error boundary own the UI for this subtree.',
      'Do: open Dev Network and see the task fetch fail with 404. Expect: the query errors; the list may still be fine on the left. Why: the boundary contains the error to the detail column so the list and tools stay usable.',
      'Do: click “Retry” after fixing nothing; you can still be in error, or if you navigate to a real task from the list, the route’s task id changes. Expect: a real id loads the task again. Why: reset or navigation replaces the bad query with a new key or a fresh attempt.',
    ],
    focus: 'detail',
  },
  {
    slug: 'background-refetch',
    title: 'Background refetch (stale time + refetchInterval)',
    summaryPlain:
      'The header’s task count chips revalidate on a timer and can also refetch when the window regains focus, so numbers do not go stale in the background.',
    callout: 'Focus: the stat chips in the header. You do not have to click to refresh; wait or refocus the window.',
    bodyTechnical: `workspaceStats in lib/queryOptions sets refetchInterval to about 20s and staleTime to about 15s so React Query will periodically refetch the counts. Default query options in createQueryClient also set refetchOnWindowFocus, so when you return to the tab, active queries that are stale can refetch in the background.

The same header component runs useQueries for profile and summary in parallel; this topic emphasizes the time-based and focus-based refresh of the stats key (workspaceKeys.stats) rather than the first parallel load.

Files: queryOptions.ts (workspaceStats), queryClient.ts (defaults), WorkspaceHeader.tsx.`,
    bodyPlain: `Dashboard numbers you care about (how many open tasks, and so on) can go out of date while you are looking at another app. A timer and “when you look back at the tab” are two low-effort ways to nudge the numbers toward fresh without a manual refresh button.

The UI does not have to block you while the refetch runs; the chips can update quietly when new data returns.`,
    tryItIntro:
      'You will watch the same three counts and optionally Dev Network without clicking anything in the list.',
    tryItSteps: [
      'Do: note the open / in progress / done values in the header, then keep the app open for about 20 to 30 seconds. Expect: the numbers can update on their own when a background refetch completes. Why: refetchInterval on the workspaceStats query revalidates on a schedule.',
      'Do: switch to another application or tab for a few seconds, then come back to this one. Expect: a focus-triggered refetch may run; Network may show a stats request. Why: refetchOnWindowFocus in the default query options is enabled in queryClient for active stale queries.',
      'Do: compare with the parallel-queries topic: first load is three parallel queries; this topic is about continued freshness of the stat chips after the first paint. Why: separating the ideas helps you tune staleTime, interval, and focus behavior without conflating them with the initial useQueries batch.',
    ],
    focus: 'background-refetch',
  },
  ]

const bySlug = new Map(learnTopics.map((t) => [t.slug, t]))

export function getLearnTopic(slug: string | undefined): LearnTopic | undefined {
  if (!slug) {
    return undefined
  }
  return bySlug.get(slug)
}

export function getAllLearnSlugs(): string[] {
  return learnTopics.map((t) => t.slug)
}
