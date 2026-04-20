import { getInitialKanbanData, useKanbanStore } from "./index"

describe("kanban store", () => {
  beforeEach(() => {
    useKanbanStore.setState(getInitialKanbanData())
  })

  it("starts with board metadata", () => {
    const state = useKanbanStore.getState()

    expect(state.boardTitle).toBe("zustand kanban board")
    expect(state.columnIds).toEqual([
      "To Do",
      "In Progress",
      "Review",
      "Done",
    ])
  })

  it("addTask appends a task", () => {
    useKanbanStore.getState().addTask({
      id: "task-new",
      title: "New task",
      content: "Body",
      column: "To Do",
    })

    const tasks = useKanbanStore.getState().tasks
    expect(tasks.some((t) => t.id === "task-new")).toBe(true)
    expect(tasks[tasks.length - 1].title).toBe("New task")
  })
})
