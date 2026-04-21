import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { createKanbanInitialData } from "./initialData"
import type { KanbanStore } from "../types"
import { createTasksSlice } from "./slices/tasksSlice"

export type { KanbanStore } from "../types"

/** localStorage key for `persist`; exported for tests. */
export const KANBAN_STORAGE_KEY = "day-8-kanban"

export function getInitialKanbanData(): Pick<
  KanbanStore,
  "boardTitle" | "columnIds" | "tasks"
> {
  return createKanbanInitialData(Date.now())
}

export const useKanbanStore = create<KanbanStore>()(
  devtools(
    persist(
      (...args) => {
        const [set] = args
        return {
          ...createKanbanInitialData(Date.now()),
          ...createTasksSlice(...args),
          resetBoard: () => {
            set(createKanbanInitialData(Date.now()))
          },
        }
      },
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
