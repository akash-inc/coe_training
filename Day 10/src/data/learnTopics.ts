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
  focus: DemoFocus
}

export const learnTopics: LearnTopic[] = [
  {
    slug: 'parallel-queries',
    title: 'Parallel queries (useQueries)',
    summaryPlain: 'Load profile, workspace, and stats at the same time instead of one after another.',
    callout: 'The header runs three network requests in parallel. Watch the stats chips fill together.',
    bodyTechnical: `The header uses useQueries from @tanstack/react-query with three query definitions from lib/queryOptions.ts: userMe(), workspaceSummary(), and workspaceStats(). Each has its own queryKey (see lib/queryKeys.ts) so the cache can refetch or invalidate them independently. React Query fires all three fetches concurrently; the UI stays in a loading state until all three complete (you can change this to show partial data by checking each sub-result). workspaceStats() sets refetchInterval and staleTime to demonstrate background refetch of counts. Files: src/components/WorkspaceHeader.tsx, src/lib/queryOptions.ts.`,
    bodyPlain: `Think of the top of the app as three separate “questions” to the server: who am I, what workspace is this, and how many tasks are in each state? The app asks all three at once, like sending three text messages in one breath instead of waiting for a reply to each. That makes the first paint faster when each answer is independent of the others.`,
    focus: 'header',
  },
  {
    slug: 'infinite-list',
    title: 'Infinite list (useInfiniteQuery)',
    summaryPlain: 'Scroll or page through tasks; each page reuses the same list cache shape.',
    callout: 'The task column loads the first “page” then appends more when you click Load more.',
    bodyTechnical: `useInfiniteQuery in src/features/tasks/TaskListInfinite.ts uses query options from tasksInfinite() in lib/queryOptions.ts. The server returns { items, nextCursor }; getNextPageParam returns the next offset or null. The UI flattens pages with flatMap. Query key includes workspace id and page size (taskKeys.infinite) for correct invalidation. listTasksPage in api/unified.ts uses Supabase .range for pagination.`,
    bodyPlain: `Instead of loading every task at once, the app fetches a small batch, then the next when you ask for it. That keeps the first screen quick and still lets you work through a long list.`,
    focus: 'list',
  },
  {
    slug: 'dependent-queries',
    title: 'Dependent queries (comments after task)',
    summaryPlain: 'Comments only fetch after the parent task is known and loaded successfully.',
    callout: 'Open a task: detail loads first; then the comments request runs. Check the two-phase behavior.',
    bodyTechnical: `In TaskDetailBoundary.tsx, task comments use the same taskId from the route, but the comments query (taskComments) has enabled: tq.isSuccess. Until the task query returns data, the comments query is disabled (status: "pending" / no fetch). That avoids hitting /comments with a stale or invalid id and models a parent/child data dependency. Files: taskComments in lib/queryOptions.ts, getTaskComments in api/unified.ts + rq10Api.ts.`,
    bodyPlain: `You would not look up “notes for task” before you know which task you opened. The app does the same: it waits until the main task is loaded, then it loads the related comments.`,
    focus: 'detail',
  },
  {
    slug: 'optimistic-mutations',
    title: 'Optimistic updates and rollback',
    summaryPlain: 'Status changes in the UI immediately, then the server is called; failure restores the last snapshot.',
    callout: 'Use “Cycle status”. Turn on “Next write fails” in Cache & debug to see rollback and the error banner.',
    bodyTechnical: `usePatchTask in features/tasks/usePatchTask.ts cancels in-flight task queries, snapshots previous list and detail cache, applies setQueryData for the new status, then calls patchTaskRemote. onError restores previous from context; onSettled invalidates taskKeys and workspace stats. The mutation uses cycleStatus for the next status. Simulated failure is in lib/simulateWriteFailure.ts, toggled in CacheToolsPanel.`,
    bodyPlain: `The app updates the card right away so it feels instant. If the server says no, it puts the old values back and shows a message—like undoing a mistaken edit when the save fails.`,
    focus: 'optimistic',
  },
  {
    slug: 'prefetching',
    title: 'Prefetch on hover (prefetchQuery)',
    summaryPlain: 'Warming the cache before you click, so the detail view feels instant.',
    callout: 'Hover a task row (don’t click yet). The detail query is prefetched; open DevTools Network to see early requests when you do this.',
    bodyTechnical: `TaskList Infinite wraps each Link onMouseEnter with queryClient.prefetchQuery(taskDetail(t.id)) so the task detail query may already be in cache with staleTime from queryOptions. This does not run the comments query, which is still dependent on the opened task. File: src/features/tasks/TaskListInfinite.tsx.`,
    bodyPlain: `If you know someone might open an item, you can “preload” that item’s data in the background when their mouse rests on the row, so the next click feels snappier.`,
    focus: 'prefetch',
  },
  {
    slug: 'cache-invalidation',
    title: 'Cache keys and invalidation',
    summaryPlain: 'Stable keys, prefix invalidation, and predicate-based invalidation for fine control.',
    callout: 'Use the Cache & debug panel: invalidate by prefix, by predicate, reset infinite data, or setQueryData manually.',
    bodyTechnical: `All task-related keys are built in lib/queryKeys.ts with the workspace id for scoping. invalidateQueries({ queryKey: taskKeys.all() }) invalidates the prefix; predicate: (q) => ... can match only one workspace. resetQueries on the infinite key clears page history. setQueryData demonstrates that the cache is an in-memory store you can patch for fast experiments. Devtools show entries per key. Files: CacheToolsPanel.tsx, queryClient.ts`,
    bodyPlain: `The app gives each “kind” of data a predictable name in the cache. You can say “throw away everything for tasks” or “only the rows that match this rule” when you need fresh data after a change.`,
    focus: 'cache',
  },
  {
    slug: 'global-errors',
    title: 'Global error handling (Query + Mutation cache)',
    summaryPlain: 'A single place to observe failures and show a dismissible banner.',
    callout: 'Trigger any failed API call (e.g. simulate next write). The top banner is fed by onError in QueryCache and MutationCache in createQueryClient.',
    bodyTechnical: `lib/queryClient.ts creates QueryClient with queryCache: new QueryCache({ onError }) and mutationCache: new MutationCache({ onError }) that forward to apiErrorBus.emit. ApiErrorLogProvider in contexts/ApiErrorLogContext.tsx subscribes and sets state; GlobalErrorBanner reads lastError. This is a cross-cutting concern without per-hook boilerplate. Non-throwing errors still surface here. Files: errorBus.ts, queryClient.ts, GlobalErrorBanner.tsx`,
    bodyPlain: `When something goes wrong in the background, the app can show one consistent message at the top so you are not left guessing, and you can dismiss it when you are done reading.`,
    focus: 'banner',
  },
  {
    slug: 'error-boundaries',
    title: 'Error boundaries and throwOnError',
    summaryPlain: 'A contained fallback when a specific query is configured to throw on failure.',
    callout: 'If a task id is invalid, the detail query can throw; QueryErrorBoundary shows retry instead of a blank screen.',
    bodyTechnical: `TaskDetailInner uses useQuery with throwOnError: true. Errors propagate to the nearest class QueryErrorBoundary (QueryErrorBoundary.tsx), which provides fallback UI and reset to clear error state. This is for exceptional failures, not for normal empty states. Global onError in the client still runs; the boundary is for the subtree UI. onReset in the boundary calls queryClient.resetQueries for the detail key.`,
    bodyPlain: `If one screen’s data is broken, you can trap that error in a small “box” with a “Try again” button instead of breaking the whole page.`,
    focus: 'detail',
  },
  {
    slug: 'background-refetch',
    title: 'Background refetch (stale time + refetchInterval)',
    summaryPlain: 'Counts in the header refresh on a timer without you clicking.',
    callout: 'Watch the open / progress / done chips over ~20s or refocus the window; stats use refetchInterval in workspaceStats().',
    bodyTechnical: `workspaceStats in lib/queryOptions.ts sets refetchInterval to ~20s and staleTime ~15s so React Query revalidates counts periodically. refetchOnWindowFocus is enabled in default options in queryClient. Together they keep dashboard-style numbers from going stale. Same header also powers parallel queries topic—here the emphasis is the timer and focus refetch, not the parallel fetch itself.`,
    bodyPlain: `The numbers at the top can refresh on their own every so often, a bit like a live sports score, so you do not have to press refresh to see the latest totals.`,
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
