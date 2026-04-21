import type { SupabaseClient } from "@supabase/supabase-js"
import {
  remoteDeleteTask,
  remoteInsertTask,
  remoteMoveTask,
  remoteUpdateTask,
} from "../../lib/supabase/boardRemote"
import type {
  ColumnId,
  KanbanStore,
  Task,
  TaskDraft,
  TasksSlice,
} from "../../types"

function taskFromDraft(draft: TaskDraft, now: number): Task {
  return {
    id: draft.id,
    title: draft.title,
    content: draft.content,
    column: draft.column,
    createdAt: draft.createdAt ?? now,
    dueDate: draft.dueDate ?? null,
    completedAt: draft.completedAt ?? null,
  }
}

function taskAfterColumnChange(
  task: Task,
  targetColumn: ColumnId,
  now: number,
): Task {
  if (targetColumn === "Done") {
    return {
      ...task,
      column: targetColumn,
      completedAt: task.completedAt ?? now,
    }
  }
  return {
    ...task,
    column: targetColumn,
    completedAt: null,
  }
}

export type HistoryCommit = (
  meta: { type: string; summary: string },
  recipe: (s: KanbanStore) => Partial<
    Pick<KanbanStore, "tasks" | "boardTitle" | "columnIds">
  >,
) => void

export function createTasksActions(
  commit: HistoryCommit,
): Pick<TasksSlice, "addTask" | "updateTask" | "moveTask" | "removeTask"> {
  return {
    addTask: (draft) =>
      commit(
        { type: "task/add", summary: `Added task "${draft.title}"` },
        (state) => ({
          tasks: [...state.tasks, taskFromDraft(draft, Date.now())],
        }),
      ),

    updateTask: (id, updates) =>
      commit(
        { type: "task/update", summary: `Updated task ${id}` },
        (state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task,
          ),
        }),
      ),

    moveTask: (id, targetColumn) =>
      commit(
        {
          type: "task/move",
          summary: `Moved task ${id} to ${targetColumn}`,
        },
        (state) => {
          const now = Date.now()
          return {
            tasks: state.tasks.map((task) =>
              task.id === id
                ? taskAfterColumnChange(task, targetColumn, now)
                : task,
            ),
          }
        },
      ),

    removeTask: (id) =>
      commit(
        { type: "task/remove", summary: `Removed task ${id}` },
        (state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }),
      ),
  }
}

export type RemoteTasksDeps = {
  get: () => KanbanStore
  commit: HistoryCommit
  rollbackLastCommit: () => void
  boardId: string
  client: SupabaseClient
  setSyncError: (message: string | null) => void
}

export function createTasksActionsWithRemote(
  d: RemoteTasksDeps,
): Pick<TasksSlice, "addTask" | "updateTask" | "moveTask" | "removeTask"> {
  async function runRemote(
    op: () => Promise<{ error: Error | null }>,
  ): Promise<void> {
    const { error } = await op()
    if (error) {
      console.error("[supabase]", error)
      d.rollbackLastCommit()
      d.setSyncError(error.message)
    } else {
      d.setSyncError(null)
    }
  }

  return {
    addTask: async (draft) => {
      const now = Date.now()
      d.commit(
        { type: "task/add", summary: `Added task "${draft.title}"` },
        (state) => ({
          tasks: [...state.tasks, taskFromDraft(draft, now)],
        }),
      )
      const task = d.get().tasks.find((t) => t.id === draft.id)
      if (!task) {
        return
      }
      await runRemote(() => remoteInsertTask(d.client, d.boardId, task))
    },

    updateTask: async (id, updates) => {
      d.commit(
        { type: "task/update", summary: `Updated task ${id}` },
        (state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task,
          ),
        }),
      )
      await runRemote(() =>
        remoteUpdateTask(d.client, d.boardId, id, updates),
      )
    },

    moveTask: async (id, targetColumn) => {
      d.commit(
        {
          type: "task/move",
          summary: `Moved task ${id} to ${targetColumn}`,
        },
        (state) => {
          const now = Date.now()
          return {
            tasks: state.tasks.map((task) =>
              task.id === id
                ? taskAfterColumnChange(task, targetColumn, now)
                : task,
            ),
          }
        },
      )
      const task = d.get().tasks.find((t) => t.id === id)
      if (!task) {
        return
      }
      await runRemote(() =>
        remoteMoveTask(
          d.client,
          d.boardId,
          id,
          targetColumn,
          task.completedAt ?? null,
        ),
      )
    },

    removeTask: async (id) => {
      d.commit(
        { type: "task/remove", summary: `Removed task ${id}` },
        (state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }),
      )
      await runRemote(() => remoteDeleteTask(d.client, d.boardId, id))
    },
  }
}
