import type { ColumnId, Task, TaskDraft } from "./board"

export type BoardSlice = {
  boardTitle: string
  columnIds: ColumnId[]
}

export type TasksSlice = {
  tasks: Task[]
  addTask: (task: TaskDraft) => void
  updateTask: (id: string, updates: Partial<Omit<Task, "id">>) => void
  moveTask: (id: string, column: ColumnId) => void
  removeTask: (id: string) => void
}

export type KanbanStore = BoardSlice &
  TasksSlice & {
    /** Replaces board snapshot with fresh sample data (actions unchanged). */
    resetBoard: () => void
  }
