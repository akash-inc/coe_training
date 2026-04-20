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
})
