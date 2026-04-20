import type { ColumnId, Task } from "../types"

export type BoardSlice = {
  boardTitle: string
  columnIds: ColumnId[]
}

export type TasksSlice = {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Omit<Task, "id">>) => void
  moveTask: (id: string, column: ColumnId) => void
}

export type KanbanStore = BoardSlice & TasksSlice
