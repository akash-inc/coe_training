import type { ColumnId, Task } from "../types"

export type BoardSlice = {
  boardTitle: string
  columnIds: ColumnId[]
}

export type TasksSlice = {
  tasks: Task[]
  addTask: (task: Task) => void
}

export type KanbanStore = BoardSlice & TasksSlice
