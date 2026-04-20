import type { KanbanStore } from "./types"
import type { ColumnId, Task } from "../types"

export const KANBAN_INITIAL_DATA: Pick<
  KanbanStore,
  "boardTitle" | "columnIds" | "tasks"
> = {
  boardTitle: "zustand kanban board",
  columnIds: ["To Do", "In Progress", "Review", "Done"] as ColumnId[],
  tasks: [
    {
      id: "task-1",
      title: "Fix login bug",
      content: "Users get signed out after refresh.",
      column: "To Do",
    },
    {
      id: "task-2",
      title: "Implement Zustand slices",
      content: "Split board, tasks, users, filters.",
      column: "In Progress",
    },
    {
      id: "task-3",
      title: "Add optimistic updates",
      content: "Rollback state when API call fails.",
      column: "Review",
    },
    {
      id: "task-4",
      title: "Create project scaffold",
      content: "Base app and test setup completed.",
      column: "Done",
    },
  ] satisfies Task[],
}
