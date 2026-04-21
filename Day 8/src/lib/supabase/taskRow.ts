import type { ColumnId, Task } from "../../types"
import type { Database } from "./database.types"

export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"]

function parseTs(iso: string | null): number | null {
  if (iso == null) {
    return null
  }
  const ms = Date.parse(iso)
  return Number.isNaN(ms) ? null : ms
}

export function taskRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    column: row.kanban_column as ColumnId,
    createdAt: Date.parse(row.created_at),
    dueDate: parseTs(row.due_date),
    completedAt: parseTs(row.completed_at),
  }
}

export function taskToInsert(
  boardId: string,
  task: Task,
): Database["public"]["Tables"]["tasks"]["Insert"] {
  return {
    id: task.id,
    board_id: boardId,
    title: task.title,
    content: task.content,
    kanban_column: task.column,
    created_at: new Date(task.createdAt).toISOString(),
    due_date:
      task.dueDate == null ? null : new Date(task.dueDate).toISOString(),
    completed_at:
      task.completedAt == null
        ? null
        : new Date(task.completedAt).toISOString(),
  }
}

export function partialTaskToUpdate(
  updates: Partial<Omit<Task, "id">>,
): Database["public"]["Tables"]["tasks"]["Update"] {
  const out: Database["public"]["Tables"]["tasks"]["Update"] = {}
  if (updates.title !== undefined) {
    out.title = updates.title
  }
  if (updates.content !== undefined) {
    out.content = updates.content
  }
  if (updates.column !== undefined) {
    out.kanban_column = updates.column
  }
  if (updates.createdAt !== undefined) {
    out.created_at = new Date(updates.createdAt).toISOString()
  }
  if (updates.dueDate !== undefined) {
    out.due_date =
      updates.dueDate == null
        ? null
        : new Date(updates.dueDate).toISOString()
  }
  if (updates.completedAt !== undefined) {
    out.completed_at =
      updates.completedAt == null
        ? null
        : new Date(updates.completedAt).toISOString()
  }
  return out
}
