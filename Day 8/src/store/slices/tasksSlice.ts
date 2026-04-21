import type { StateCreator } from "zustand"
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

export const createTasksSlice: StateCreator<
  KanbanStore,
  [],
  [],
  Pick<TasksSlice, "addTask" | "updateTask" | "moveTask" | "removeTask">
> = (set) => ({
  addTask: (draft) =>
    set((state) => ({
      tasks: [...state.tasks, taskFromDraft(draft, Date.now())],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task,
      ),
    })),

  moveTask: (id, targetColumn) =>
    set((state) => {
      const now = Date.now()
      return {
        tasks: state.tasks.map((task) =>
          task.id === id
            ? taskAfterColumnChange(task, targetColumn, now)
            : task,
        ),
      }
    }),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
})
