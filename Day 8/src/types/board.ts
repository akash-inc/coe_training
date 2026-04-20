export type ColumnId = "To Do" | "In Progress" | "Review" | "Done"

export type Task = {
  id: string
  title: string
  content: string
  column: ColumnId
}
