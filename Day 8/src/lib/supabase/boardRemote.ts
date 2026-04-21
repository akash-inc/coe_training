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
