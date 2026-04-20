import { create } from "zustand"
import type { KanbanStore } from "./types"
import { createBoardSlice } from "./slices/boardSlice"

export type { KanbanStore } from "./types"

export function getInitialKanbanData(): Pick<
  KanbanStore,
  "boardTitle" | "columnIds"
> {
  return {
    boardTitle: "zustand kanban board",
    columnIds: ["To Do", "In Progress", "Review", "Done"],
  }
}

export const useKanbanStore = create<KanbanStore>()((...args) => ({
  ...createBoardSlice(...args),
}))
