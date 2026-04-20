import type { StateCreator } from "zustand"
import type { KanbanStore, TasksSlice } from "../types"

export const createTasksSlice: StateCreator<
  KanbanStore,
  [],
  [],
  Pick<TasksSlice, "addTask" | "updateTask" | "moveTask">
> = (set) => ({
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) => task.id === id ? { ...task, ...updates } : task),
    })),

  moveTask: (id, column) =>
    set((state) => ({
      tasks: state.tasks.map((task) => task.id === id ? { ...task, column } : task),
    })),
})
