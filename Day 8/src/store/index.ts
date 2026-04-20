import { create } from "zustand"
import { KANBAN_INITIAL_DATA } from "./initialData"
import type { KanbanStore } from "./types"
import { createTasksSlice } from "./slices/tasksSlice"

export type { KanbanStore } from "./types"

export function getInitialKanbanData(): Pick<
  KanbanStore,
  "boardTitle" | "columnIds" | "tasks"
> {
  return { ...KANBAN_INITIAL_DATA }
}

export const useKanbanStore = create<KanbanStore>()((...args) => ({
  ...KANBAN_INITIAL_DATA,
  ...createTasksSlice(...args),
}))
