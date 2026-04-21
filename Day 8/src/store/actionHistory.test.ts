import { getInitialKanbanData, useKanbanStore } from "./index"

describe("action history / undo-redo", () => {
  type HistoryAwareState = ReturnType<typeof useKanbanStore.getState> & {
    undo: () => void
    redo: () => void
    activityLog: ReadonlyArray<{
      type: string
      summary: string
      at: number
    }>
  }

  const state = (): HistoryAwareState =>
    useKanbanStore.getState() as unknown as HistoryAwareState

  beforeEach(() => {
    localStorage.clear()
    useKanbanStore.setState(getInitialKanbanData())
  })

  it("records user-facing actions in activity order after state changes", () => {
    state().moveTask("task-1", "In Progress")
    state().updateTask("task-1", { title: "Updated title" })

    const log = state().activityLog
    expect(log.length).toBeGreaterThanOrEqual(2)
    expect(log[log.length - 2]?.type).toMatch(/move|task\/move/i)
    expect(log[log.length - 1]?.type).toMatch(/update|task\/update/i)
    expect(log.every((e) => typeof e.at === "number")).toBe(true)
  })

  it("undo restores board snapshot before the last change; redo reapplies it", () => {
    const before = state().tasks.find((t) => t.id === "task-1")?.column

    state().moveTask("task-1", "Done")
    expect(state().tasks.find((t) => t.id === "task-1")?.column).toBe("Done")

    state().undo()
    expect(state().tasks.find((t) => t.id === "task-1")?.column).toBe(before)

    state().redo()
    expect(state().tasks.find((t) => t.id === "task-1")?.column).toBe("Done")
  })

  it("new mutation after undo clears the redo branch", () => {
    state().moveTask("task-1", "In Progress")
    state().undo()
    state().moveTask("task-2", "Review")

    state().redo()
    expect(state().tasks.find((t) => t.id === "task-1")?.column).not.toBe(
      "In Progress",
    )
  })
})
