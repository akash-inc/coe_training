import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { KANBAN_INITIAL_DATA } from "./initialData"
import type { KanbanStore } from "../types"
import { createTasksSlice } from "./slices/tasksSlice"

export type { KanbanStore } from "../types"

/** localStorage key for `persist`; exported for tests. */
export const KANBAN_STORAGE_KEY = "day-8-kanban"

export function getInitialKanbanData(): Pick<
  KanbanStore,
  "boardTitle" | "columnIds" | "tasks"
> {
  return { ...KANBAN_INITIAL_DATA }
}

export const useKanbanStore = create<KanbanStore>()(
  devtools(
    persist(
      (...args) => ({
        ...KANBAN_INITIAL_DATA,
        ...createTasksSlice(...args),
      }),
      {
        name: KANBAN_STORAGE_KEY,
        partialize: (state) => ({
          boardTitle: state.boardTitle,
          columnIds: state.columnIds,
          tasks: state.tasks,
        }),
      },
    ),
    {
      name: "KanbanStore",
      enabled: import.meta.env.DEV,
    },
  ),
)
