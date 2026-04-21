import { describe, expect, it } from "vitest"
import type { Task } from "../../types"
import { planTaskReconciliation } from "./boardRemote"

function task(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: "T",
    content: "",
    column: "To Do",
    createdAt: 1,
    dueDate: null,
    completedAt: null,
    ...overrides,
  }
}

describe("planTaskReconciliation", () => {
  it("plans deletes, inserts, then updates", () => {
    const plan = planTaskReconciliation(
      [task("a"), task("b")],
      [
        task("a", { column: "Done", completedAt: 99 }),
        task("c", { title: "new" }),
      ],
    )

    expect(plan.map((o) => o.kind)).toEqual(["delete", "insert", "update"])
    expect(plan[0]).toEqual({ kind: "delete", id: "b" })
    expect(plan[1]).toEqual({ kind: "insert", task: task("c", { title: "new" }) })
    expect(plan[2]).toEqual({
      kind: "update",
      task: task("a", { column: "Done", completedAt: 99 }),
    })
  })

  it("does not update when content is unchanged", () => {
    const t1 = task("a", { column: "Done", completedAt: 5 })
    const plan = planTaskReconciliation([t1], [task("a", { column: "Done", completedAt: 5 })])
    expect(plan).toEqual([])
  })
})
