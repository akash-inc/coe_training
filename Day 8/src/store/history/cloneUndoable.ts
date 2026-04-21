import type { KanbanStore } from "../../types"
import type { UndoableSnapshot } from "../../types/store"

export function cloneUndoable(state: KanbanStore): UndoableSnapshot {
  return {
    boardTitle: state.boardTitle,
    columnIds: [...state.columnIds],
    tasks: state.tasks.map((task) => ({ ...task })),
  }
}