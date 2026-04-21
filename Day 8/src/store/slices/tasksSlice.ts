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
