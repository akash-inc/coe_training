import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { createKanbanInitialData } from "./initialData"
import type { KanbanStore } from "../types"
import { createTasksActions } from "./slices/tasksSlice"
import { appendActivityLog } from "./history/activityLog"
import { cloneUndoable } from "./history/cloneUndoable"

export type { KanbanStore } from "../types"

/** localStorage key for `persist`; exported for tests. */
export const KANBAN_STORAGE_KEY = "day-8-kanban"

export function getInitialKanbanData(): Pick<
  KanbanStore,
  | "boardTitle"
  | "columnIds"
  | "tasks"
  | "pastSnapshots"
  | "futureSnapshots"
  | "activityLog"
> {
  return createKanbanInitialData(Date.now())
}

function applySnapshot(snapshot: ReturnType<typeof cloneUndoable>): Pick<
  KanbanStore,
  "boardTitle" | "columnIds" | "tasks"
> {
  return {
    boardTitle: snapshot.boardTitle,
    columnIds: [...snapshot.columnIds],
    tasks: snapshot.tasks.map((t) => ({ ...t })),
  }
}

export const useKanbanStore = create<KanbanStore>()(
  devtools(
    persist(
      (...args) => {
        const [set] = args
        function commit(
          meta: { type: string; summary: string },
          recipe: (s: KanbanStore) => Partial<
            Pick<KanbanStore, "tasks" | "boardTitle" | "columnIds">
          >,
        ) {
          set((state) => {
            const snapshot = cloneUndoable(state)
            const patch = recipe(state)
            return {
              pastSnapshots: [...state.pastSnapshots, snapshot],
              futureSnapshots: [],
              activityLog: appendActivityLog(state.activityLog, {
                ...meta,
                id: crypto.randomUUID(),
                at: Date.now(),
              }),
              ...patch,
            }
          })
        }

        return {
          ...createKanbanInitialData(Date.now()),
          ...createTasksActions(commit),
          resetBoard: () => {
            set({
              ...createKanbanInitialData(Date.now()),
            })
          },
          undo: () => {
            set((state) => {
              if (state.pastSnapshots.length === 0) {
                return {}
              }
              const previous =
                state.pastSnapshots[state.pastSnapshots.length - 1]!
              const restPast = state.pastSnapshots.slice(0, -1)
              const current = cloneUndoable(state)
              return {
                ...applySnapshot(previous),
                pastSnapshots: restPast,
                futureSnapshots: [current, ...state.futureSnapshots],
              }
            })
          },
          redo: () => {
            set((state) => {
              if (state.futureSnapshots.length === 0) {
                return {}
              }
              const [next, ...restFuture] = state.futureSnapshots
              const current = cloneUndoable(state)
              return {
                ...applySnapshot(next),
                pastSnapshots: [...state.pastSnapshots, current],
                futureSnapshots: restFuture,
              }
            })
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
