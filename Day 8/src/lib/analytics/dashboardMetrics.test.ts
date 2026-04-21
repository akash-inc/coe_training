import type { Task } from "../../types"
import { computeDashboardMetrics } from "./dashboardMetrics"

const base = (partial: Omit<Task, "id" | "title" | "content"> & Partial<Pick<Task, "id" | "title" | "content">>): Task => ({
  id: partial.id ?? "t",
  title: partial.title ?? "T",
  content: partial.content ?? "",
  ...partial,
})

describe("computeDashboardMetrics", () => {
  const now = Date.UTC(2026, 3, 20, 12, 0, 0)

  it("derives totals, completion %, active, completed, overdue from tasks + now", () => {
    const tasks: Task[] = [
      base({
        id: "a",
        column: "To Do",
        createdAt: now - 86400000,
        dueDate: now - 1000,
      }),
      base({ id: "b", column: "In Progress", createdAt: now - 100 }),
      base({
        id: "c",
        column: "Done",
        createdAt: now - 5 * 86400000,
        completedAt: now - 86400000,
      }),
    ]

    const m = computeDashboardMetrics(tasks, now)

    expect(m.totalTasks).toBe(3)
    expect(m.completedCount).toBe(1)
    expect(m.activeCount).toBe(2)
    expect(m.overdueCount).toBe(1)
    expect(m.completionPercentage).toBeCloseTo(33.3, 5)
  })

  it("returns null average when nothing is Done with completion time", () => {
    const m = computeDashboardMetrics(
      [
        base({
          id: "a",
          column: "To Do",
          createdAt: now,
          dueDate: null,
          completedAt: null,
        }),
      ],
      now,
    )
    expect(m.averageCompletionTimeMs).toBeNull()
  })

  it("averages completion duration for Done tasks with completedAt", () => {
    const tasks: Task[] = [
      base({
        id: "c",
        column: "Done",
        createdAt: 100,
        completedAt: 1100,
      }),
      base({
        id: "d",
        column: "Done",
        createdAt: 0,
        completedAt: 200,
      }),
    ]
    const m = computeDashboardMetrics(tasks, now)
    expect(m.averageCompletionTimeMs).toBe((1000 + 200) / 2)
  })

  it("marks trend insufficient when fewer than two completed tasks", () => {
    const m = computeDashboardMetrics(
      [
        base({
          id: "c",
          column: "Done",
          createdAt: now - 10 * 86400000,
          completedAt: now - 86400000,
        }),
      ],
      now,
    )
    expect(m.trend).toBe("insufficient_data")
  })

  it("compares recent vs prior completion speed inside the trend window", () => {
    const windowMs = 7 * 86400000
    const tasks: Task[] = [
      base({
        id: "old",
        column: "Done",
        createdAt: now - 40 * 86400000,
        completedAt: now - 20 * 86400000,
      }),
      base({
        id: "recent",
        column: "Done",
        createdAt: now - 5 * 86400000,
        completedAt: now - 2 * 86400000,
      }),
    ]

    const fasterRecent = computeDashboardMetrics(tasks, now, { trendWindowMs: windowMs })
    expect(fasterRecent.trend).toBe("improving")

    const slowerRecent: Task[] = [
      base({
        id: "prior-slow",
        column: "Done",
        createdAt: now - 25 * 86400000,
        completedAt: now - 20 * 86400000,
      }),
      base({
        id: "recent-slower",
        column: "Done",
        createdAt: now - 12 * 86400000,
        completedAt: now - 2 * 86400000,
      }),
    ]
    const declining = computeDashboardMetrics(slowerRecent, now, { trendWindowMs: windowMs })
    expect(declining.trend).toBe("declining")
  })
})
