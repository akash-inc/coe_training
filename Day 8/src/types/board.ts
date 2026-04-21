export type ColumnId = "To Do" | "In Progress" | "Review" | "Done"

export type Task = {
  id: string
  title: string
  content: string
  column: ColumnId
  createdAt: number
  dueDate?: number | null
  completedAt?: number | null
}

/** `addTask` accepts this shape; the store fills omitted timestamps. */
export type TaskDraft = Omit<Task, "createdAt" | "dueDate" | "completedAt"> & {
  createdAt?: number
  dueDate?: number | null
  completedAt?: number | null
}
