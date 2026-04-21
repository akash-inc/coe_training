import type { ColumnId, KanbanStore, Task } from "../types"

const MS_PER_DAY = 86_400_000
const MS_PER_HOUR = 3_600_000

/** Shared lead time for Done seed tasks so the demo trend stays "stable". */
const SEED_LEAD_TIME_MS = 3 * MS_PER_DAY + 8 * MS_PER_HOUR

/**
 * Seed tasks anchored to `referenceTimeMs` (use `Date.now()` in the store).
 * Done tasks use two adjacent 7-day completion bands (see dashboard trend): the
 * “previous” band is 8–14 days ago, the “current” band is 0–7 days ago.
 */
export function createKanbanInitialData(
  referenceTimeMs: number,
): Pick<
  KanbanStore,
  | "boardTitle"
  | "columnIds"
  | "tasks"
  | "pastSnapshots"
  | "futureSnapshots"
  | "activityLog"
  | "syncError"
  | "remoteHydrated"
> {
  const inactiveCreatedAt = referenceTimeMs - 45 * MS_PER_DAY
  const previousPeriodCompletedAt = referenceTimeMs - 10 * MS_PER_DAY
  const previousPeriodCreatedAt = previousPeriodCompletedAt - SEED_LEAD_TIME_MS
  const currentPeriodCompletedAt = referenceTimeMs - 2 * MS_PER_DAY
  const currentPeriodCreatedAt = currentPeriodCompletedAt - SEED_LEAD_TIME_MS

  const createdOffset = (daysAgo: number) =>
    referenceTimeMs - daysAgo * MS_PER_DAY

  return {
    boardTitle: "zustand kanban board",
    columnIds: ["To Do", "In Progress", "Review", "Done"] as ColumnId[],
    pastSnapshots: [],
    futureSnapshots: [],
    activityLog: [],
    syncError: null,
    remoteHydrated: false,
    tasks: [
      {
        id: "task-1",
        title: "Fix login bug",
        content: "Users get signed out after refresh.",
        column: "To Do",
        createdAt: inactiveCreatedAt,
        dueDate: referenceTimeMs - MS_PER_DAY,
        completedAt: null,
      },
      {
        id: "task-2",
        title: "Implement Zustand slices",
        content: "Split board, tasks, users, filters.",
        column: "In Progress",
        createdAt: createdOffset(40),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-3",
        title: "Add optimistic updates",
        content: "Rollback state when API call fails.",
        column: "Review",
        createdAt: createdOffset(38),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-4",
        title: "Create project scaffold",
        content: "Base app and test setup completed.",
        column: "Done",
        createdAt: previousPeriodCreatedAt,
        dueDate: null,
        completedAt: previousPeriodCompletedAt,
      },
      {
        id: "task-5",
        title: "Add analytics dashboard",
        content: "Show completion %, overdue, avg time, trend.",
        column: "Done",
        createdAt: currentPeriodCreatedAt,
        dueDate: null,
        completedAt: currentPeriodCompletedAt,
      },
      {
        id: "task-6",
        title: "Wire up React Router",
        content: "Board route, lazy-loaded settings, 404 fallback.",
        column: "Done",
        createdAt: previousPeriodCreatedAt,
        dueDate: null,
        completedAt: previousPeriodCompletedAt,
      },
      {
        id: "task-7",
        title: "Draft accessibility checklist",
        content: "Focus order, labels, and reduced-motion behavior.",
        column: "To Do",
        createdAt: createdOffset(12),
        dueDate: referenceTimeMs - 2 * MS_PER_DAY,
        completedAt: null,
      },
      {
        id: "task-8",
        title: "Document env variables",
        content: ".env.example plus README section for local dev.",
        column: "To Do",
        createdAt: createdOffset(10),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-9",
        title: "Smoke test drag-and-drop",
        content: "Cover To Do → In Progress → Review in Cypress.",
        column: "To Do",
        createdAt: createdOffset(9),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-10",
        title: "Tighten ESLint config",
        content: "Align import order and hook rules with team defaults.",
        column: "To Do",
        createdAt: createdOffset(8),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-11",
        title: "Prototype column WIP limits",
        content: "Soft cap with warning badge before hard block.",
        column: "In Progress",
        createdAt: createdOffset(7),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-12",
        title: "Normalize task timestamps",
        content: "Ensure moveTask sets completedAt only when entering Done.",
        column: "In Progress",
        createdAt: createdOffset(6),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-13",
        title: "Sketch empty states",
        content: "Illustrations for zero tasks per column.",
        column: "In Progress",
        createdAt: createdOffset(5),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-14",
        title: "Review error boundaries",
        content: "Board-level boundary plus per-column fallback copy.",
        column: "Review",
        createdAt: createdOffset(11),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-15",
        title: "Audit bundle size",
        content: "Compare main chunk before/after dashboard chunk.",
        column: "Review",
        createdAt: createdOffset(4),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-16",
        title: "Localization pass",
        content: "Extract column labels and dashboard strings to i18n map.",
        column: "Review",
        createdAt: createdOffset(3),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-17",
        title: "Ship keyboard shortcuts help",
        content: "Modal listing ? for shortcuts and Esc to close.",
        column: "Done",
        createdAt: previousPeriodCreatedAt,
        dueDate: null,
        completedAt: previousPeriodCompletedAt,
      },
      {
        id: "task-18",
        title: "Hook up persist middleware",
        content: "Zustand persist with partialize for board + tasks.",
        column: "Done",
        createdAt: currentPeriodCreatedAt,
        dueDate: null,
        completedAt: currentPeriodCompletedAt,
      },
      {
        id: "task-19",
        title: "Backfill unit tests for metrics",
        content: "Trend window edges and overdue when dueDate is null.",
        column: "To Do",
        createdAt: createdOffset(2),
        dueDate: null,
        completedAt: null,
      },
      {
        id: "task-20",
        title: "Polish dashboard spacing",
        content: "Match board rhythm: labels, gaps, and heading scale.",
        column: "To Do",
        createdAt: createdOffset(1),
        dueDate: null,
        completedAt: null,
      },
    ] satisfies Task[],
  }
}
