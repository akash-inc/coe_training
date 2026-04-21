import type { ColumnId, Task } from "../../types"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  partialTaskToUpdate,
  taskRowToTask,
  taskToInsert,
} from "./taskRow"

export async function fetchBoardAndTasks(
  client: SupabaseClient,
  boardId: string,
): Promise<{ boardTitle: string; tasks: Task[] } | null> {
  const { data: board, error: boardError } = await client
    .from("boards")
    .select("title")
    .eq("id", boardId)
    .maybeSingle()

  if (boardError || !board) {
    return null
  }

  const { data: rows, error: tasksError } = await client
    .from("tasks")
    .select("*")
    .eq("board_id", boardId)
    .order("created_at", { ascending: true })

  if (tasksError || !rows) {
    return null
  }

  return {
    boardTitle: board.title,
    tasks: rows.map(taskRowToTask),
  }
}

export async function remoteInsertTask(
  client: SupabaseClient,
  boardId: string,
  task: Task,
): Promise<{ error: Error | null }> {
  const { error } = await client.from("tasks").insert(taskToInsert(boardId, task))
  return { error: error ? new Error(error.message) : null }
}

export async function remoteUpdateTask(
  client: SupabaseClient,
  boardId: string,
  taskId: string,
  updates: Partial<Omit<Task, "id">>,
): Promise<{ error: Error | null }> {
  const patch = partialTaskToUpdate(updates)
  if (Object.keys(patch).length === 0) {
    return { error: null }
  }
  const { error } = await client
    .from("tasks")
    .update(patch)
    .eq("id", taskId)
    .eq("board_id", boardId)
  return { error: error ? new Error(error.message) : null }
}

export async function remoteMoveTask(
  client: SupabaseClient,
  boardId: string,
  taskId: string,
  targetColumn: ColumnId,
  completedAt: number | null,
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from("tasks")
    .update({
      kanban_column: targetColumn,
      completed_at:
        completedAt == null ? null : new Date(completedAt).toISOString(),
    })
    .eq("id", taskId)
    .eq("board_id", boardId)
  return { error: error ? new Error(error.message) : null }
}

export async function remoteDeleteTask(
  client: SupabaseClient,
  boardId: string,
  taskId: string,
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("board_id", boardId)
  return { error: error ? new Error(error.message) : null }
}

function tasksContentEqual(a: Task, b: Task): boolean {
  return (
    a.title === b.title &&
    a.content === b.content &&
    a.column === b.column &&
    a.createdAt === b.createdAt &&
    a.dueDate === b.dueDate &&
    a.completedAt === b.completedAt
  )
}

export type TaskReconcileOp =
  | { kind: "delete"; id: string }
  | { kind: "insert"; task: Task }
  | { kind: "update"; task: Task }

/** Ordered steps to make `fromTasks` (server) match `toTasks` (local target). */
export function planTaskReconciliation(
  fromTasks: Task[],
  toTasks: Task[],
): TaskReconcileOp[] {
  const fromMap = new Map(fromTasks.map((t) => [t.id, t]))
  const toMap = new Map(toTasks.map((t) => [t.id, t]))
  const ops: TaskReconcileOp[] = []

  for (const id of fromMap.keys()) {
    if (!toMap.has(id)) {
      ops.push({ kind: "delete", id })
    }
  }

  for (const task of toTasks) {
    if (!fromMap.has(task.id)) {
      ops.push({ kind: "insert", task })
    }
  }

  for (const task of toTasks) {
    const fromTask = fromMap.get(task.id)
    if (fromTask && !tasksContentEqual(fromTask, task)) {
      ops.push({ kind: "update", task })
    }
  }

  return ops
}

/**
 * Assumes `fromTasks` matches the server before this local history step; mutates
 * Supabase so it matches `toTasks` (used after undo/redo).
 */
export async function reconcileRemoteTasks(
  client: SupabaseClient,
  boardId: string,
  fromTasks: Task[],
  toTasks: Task[],
): Promise<{ error: Error | null }> {
  for (const op of planTaskReconciliation(fromTasks, toTasks)) {
    if (op.kind === "delete") {
      const { error } = await remoteDeleteTask(client, boardId, op.id)
      if (error) {
        return { error }
      }
      continue
    }
    if (op.kind === "insert") {
      const { error } = await remoteInsertTask(client, boardId, op.task)
      if (error) {
        return { error }
      }
      continue
    }
    const { error } = await remoteUpdateTask(client, boardId, op.task.id, {
      title: op.task.title,
      content: op.task.content,
      column: op.task.column,
      createdAt: op.task.createdAt,
      dueDate: op.task.dueDate,
      completedAt: op.task.completedAt,
    })
    if (error) {
      return { error }
    }
  }
  return { error: null }
}
