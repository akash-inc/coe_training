import type { Task } from "../../types"
import { computeDashboardMetrics } from "./dashboardMetrics"

function taskFixture(
  overrides: Partial<Task> &
    Pick<Task, "column" | "createdAt">,
): Task {
  return {
    id: overrides.id ?? "task-fixture",
    title: overrides.title ?? "Fixture title",
    content: overrides.content ?? "",
    dueDate: overrides.dueDate ?? null,
    completedAt: overrides.completedAt ?? null,
    ...overrides,
  }
}

describe("computeDashboardMetrics", () => {
  const now = Date.UTC(2026, 3, 20, 12, 0, 0)

  it("derives totals, completion %, active, completed, overdue from tasks + now", () => {
    const tasks: Task[] = [
      taskFixture({
        id: "a",
        column: "To Do",
        createdAt: now - 86400000,
        dueDate: now - 1000,
      }),
      taskFixture({ id: "b", column: "In Progress", createdAt: now - 100 }),
      taskFixture({
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
        taskFixture({
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
      taskFixture({
        id: "c",
        column: "Done",
        createdAt: 100,
        completedAt: 1100,
      }),
      taskFixture({
        id: "d",
        column: "Done",
        createdAt: 0,
        completedAt: 200,
      }),
    ]
    const m = computeDashboardMetrics(tasks, now)
    expect(m.averageCompletionTimeMs).toBe((1000 + 200) / 2)
  })

  it("uses stable trend when only one completion has a measurable lead time", () => {
    const m = computeDashboardMetrics(
      [
        taskFixture({
          id: "c",
          column: "Done",
          createdAt: now - 10 * 86400000,
          completedAt: now - 86400000,
        }),
      ],
      now,
    )
    expect(m.trend).toBe("stable")
  })

  it("uses none when no Done task has created and completed timestamps", () => {
    const m = computeDashboardMetrics(
      [
        taskFixture({
          id: "c",
          column: "Done",
          createdAt: now,
          completedAt: null,
        }),
      ],
      now,
    )
    expect(m.trend).toBe("none")
  })

  it("compares the current period to the immediately previous period (equal length)", () => {
    const periodMs = 7 * 86400000
    const improving: Task[] = [
      taskFixture({
        id: "prior-slow",
        column: "Done",
        createdAt: now - 20 * 86400000,
        completedAt: now - 10 * 86400000,
      }),
      taskFixture({
        id: "current-fast",
        column: "Done",
        createdAt: now - 4 * 86400000,
        completedAt: now - 2 * 86400000,
      }),
    ]

    expect(
      computeDashboardMetrics(improving, now, { trendWindowMs: periodMs }).trend,
    ).toBe("improving")

    const declining: Task[] = [
      taskFixture({
        id: "prior-fast",
        column: "Done",
        createdAt: now - 12 * 86400000,
        completedAt: now - 10 * 86400000,
      }),
      taskFixture({
        id: "current-slow",
        column: "Done",
        createdAt: now - 12 * 86400000,
        completedAt: now - 2 * 86400000,
      }),
    ]
    expect(
      computeDashboardMetrics(declining, now, { trendWindowMs: periodMs }).trend,
    ).toBe("declining")
  })

  it("falls back to current period vs older completions when the prior period is empty", () => {
    const periodMs = 7 * 86400000
    const tasks: Task[] = [
      taskFixture({
        id: "ancient",
        column: "Done",
        createdAt: now - 90 * 86400000,
        completedAt: now - 40 * 86400000,
      }),
      taskFixture({
        id: "current",
        column: "Done",
        createdAt: now - 9 * 86400000,
        completedAt: now - 1 * 86400000,
      }),
    ]
    expect(
      computeDashboardMetrics(tasks, now, { trendWindowMs: periodMs }).trend,
    ).toBe("improving")
  })
})
