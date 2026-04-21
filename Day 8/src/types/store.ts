import type { ColumnId, Task, TaskDraft } from "./board"

export type BoardSlice = {
  boardTitle: string
  columnIds: ColumnId[]
}

export type TasksSlice = {
  tasks: Task[]
  addTask: (task: TaskDraft) => void | Promise<void>
  updateTask: (
    id: string,
    updates: Partial<Omit<Task, "id">>,
  ) => void | Promise<void>
  moveTask: (id: string, column: ColumnId) => void | Promise<void>
  removeTask: (id: string) => void | Promise<void>
}

export type UndoableSnapshot = {
  boardTitle: string
  columnIds: ColumnId[]
  tasks: Task[]
}

export type HistorySlice = {
  pastSnapshots: UndoableSnapshot[]
  futureSnapshots: UndoableSnapshot[]
  activityLog: activityEntry[]
  undo: () => void
  redo: () => void
}

export type KanbanStore = BoardSlice &
  TasksSlice &
  HistorySlice & {
    /** Replaces board snapshot with fresh sample data (actions unchanged). */
    resetBoard: () => void
    syncError: string | null
    remoteHydrated: boolean
    hydrateFromRemote: () => Promise<void>
    clearSyncError: () => void
  }

export type activityEntry = {
  id: string,
  type: string,
  summary: string,
  at: number,
}