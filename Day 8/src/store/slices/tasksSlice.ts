import type { StateCreator } from "zustand"
import type { KanbanStore, TasksSlice } from "../types"

export const createTasksSlice: StateCreator<
  KanbanStore,
  [],
  [],
  Pick<TasksSlice, "addTask">
> = (set) => ({
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) => task.id === id ? { ...task, ...updates } : task),
    })),
})
