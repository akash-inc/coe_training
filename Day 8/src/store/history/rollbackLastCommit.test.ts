import { describe, expect, it, vi } from "vitest"
import type { KanbanStore, UndoableSnapshot } from "../../types"
import { buildRollbackLastCommit } from "./rollbackLastCommit"

function applySnapshot(
  snapshot: UndoableSnapshot,
): Pick<KanbanStore, "boardTitle" | "columnIds" | "tasks"> {
  return {
    boardTitle: snapshot.boardTitle,
    columnIds: [...snapshot.columnIds],
    tasks: snapshot.tasks.map((t) => ({ ...t })),
  }
}

describe("buildRollbackLastCommit", () => {
  it("restores the last past snapshot and trims past + activity log", () => {
    const previous: UndoableSnapshot = {
      boardTitle: "before",
      columnIds: ["To Do", "In Progress", "Review", "Done"],
      tasks: [
        {
          id: "t1",
          title: "A",
          content: "",
          column: "To Do",
          createdAt: 1,
          dueDate: null,
          completedAt: null,
        },
      ],
    }

    let state: Partial<KanbanStore> = {
      boardTitle: "after",
      columnIds: ["To Do", "In Progress", "Review", "Done"],
      tasks: [
        {
          id: "t1",
          title: "B",
          content: "",
          column: "Done",
          createdAt: 1,
          dueDate: null,
          completedAt: 99,
        },
      ],
      pastSnapshots: [previous],
      futureSnapshots: [],
      activityLog: [
        { id: "log-1", type: "task/move", summary: "moved", at: 2 },
      ],
    }

    const set = vi.fn(
      (
        updater: Partial<KanbanStore> | ((s: KanbanStore) => Partial<KanbanStore>),
      ) => {
        const patch =
          typeof updater === "function"
            ? updater(state as KanbanStore)
            : updater
        state = { ...state, ...patch }
      },
    )

    const rollback = buildRollbackLastCommit(set, applySnapshot)
    rollback()

    expect(state.boardTitle).toBe("before")
    expect(state.tasks?.[0]?.title).toBe("A")
    expect(state.pastSnapshots).toEqual([])
    expect(state.activityLog).toEqual([])
    expect(state.futureSnapshots).toEqual([])
  })
})
