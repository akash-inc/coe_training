import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import {
  fetchBoardAndTasks,
  reconcileRemoteTasks,
} from "../lib/supabase/boardRemote"
import {
  getDefaultBoardId,
  getSupabaseClient,
  isSupabaseConfigured,
} from "../lib/supabase/client"
import type { KanbanStore, UndoableSnapshot } from "../types"
import { appendActivityLog } from "./history/activityLog"
import { cloneUndoable } from "./history/cloneUndoable"
import { buildRollbackLastCommit } from "./history/rollbackLastCommit"
import { createKanbanInitialData } from "./initialData"
import {
  createTasksActions,
  createTasksActionsWithRemote,
} from "./slices/tasksSlice"

export type { KanbanStore } from "../types"

/** localStorage key for `persist`; exported for tests. */
export const KANBAN_STORAGE_KEY = "day-8-kanban"

function remoteBoardPersistenceEnabled(): boolean {
  return isSupabaseConfigured() && getDefaultBoardId() != null
}

export function getInitialKanbanData(): Pick<
  KanbanStore,
  | "boardTitle"
  | "columnIds"
  | "tasks"
  | "pastSnapshots"
  | "futureSnapshots"
  | "activityLog"
  | "syncError"
  | "remoteHydrated"
> {
  return createKanbanInitialData(Date.now())
}

function applySnapshot(
  snapshot: ReturnType<typeof cloneUndoable>,
): Pick<KanbanStore, "boardTitle" | "columnIds" | "tasks"> {
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
        const [set, get] = args
        const rollbackLastCommit = buildRollbackLastCommit(set, applySnapshot)

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

        const supabase = getSupabaseClient()
        const boardId = getDefaultBoardId()
        const useRemote = Boolean(supabase && boardId)

        const setSyncError = (message: string | null) => {
          set({ syncError: message })
        }

        const taskActions = useRemote
          ? createTasksActionsWithRemote({
              get,
              commit,
              rollbackLastCommit,
              boardId: boardId!,
              client: supabase!,
              setSyncError,
            })
          : createTasksActions(commit)

        const hydrateFromRemote = async () => {
          const client = getSupabaseClient()
          const bid = getDefaultBoardId()
          if (!client || !bid) {
            return
          }
          set({ syncError: null })
          const data = await fetchBoardAndTasks(client, bid)
          if (!data) {
            set({
              syncError: "Failed to load board from Supabase",
              remoteHydrated: true,
            })
            return
          }
          set({
            boardTitle: data.boardTitle,
            tasks: data.tasks,
            pastSnapshots: [],
            futureSnapshots: [],
            activityLog: [],
            syncError: null,
            remoteHydrated: true,
          })
        }

        return {
          ...createKanbanInitialData(Date.now()),
          ...taskActions,
          resetBoard: () => {
            if (remoteBoardPersistenceEnabled()) {
              set({
                pastSnapshots: [],
                futureSnapshots: [],
                activityLog: [],
                syncError: null,
              })
              void hydrateFromRemote()
            } else {
              set({
                ...createKanbanInitialData(Date.now()),
              })
            }
          },
          syncError: null,
          remoteHydrated: false,
          hydrateFromRemote,
          clearSyncError: () => set({ syncError: null }),
          undo: () => {
            const syncRemote =
              remoteBoardPersistenceEnabled() &&
              getSupabaseClient() != null &&
              getDefaultBoardId() != null
            const client = getSupabaseClient()
            const bid = getDefaultBoardId()

            let remoteUndo:
              | {
                  previous: UndoableSnapshot
                  restPast: UndoableSnapshot[]
                  currentClone: UndoableSnapshot
                  oldFuture: UndoableSnapshot[]
                }
              | undefined

            set((state) => {
              if (state.pastSnapshots.length === 0) {
                return {}
              }
              const previous =
                state.pastSnapshots[state.pastSnapshots.length - 1]!
              const restPast = state.pastSnapshots.slice(0, -1)
              const currentClone = cloneUndoable(state)
              const oldFuture = state.futureSnapshots
              if (syncRemote && client && bid) {
                remoteUndo = { previous, restPast, currentClone, oldFuture }
              }
              return {
                ...applySnapshot(previous),
                pastSnapshots: restPast,
                futureSnapshots: [currentClone, ...oldFuture],
              }
            })

            if (remoteUndo && client && bid) {
              const { previous, restPast, currentClone, oldFuture } = remoteUndo
              void reconcileRemoteTasks(
                client,
                bid,
                currentClone.tasks,
                previous.tasks,
              ).then(({ error }) => {
                if (error) {
                  console.error("[supabase] undo reconcile", error)
                  set({
                    ...applySnapshot(currentClone),
                    pastSnapshots: [...restPast, previous],
                    futureSnapshots: oldFuture,
                    syncError: error.message,
                  })
                } else {
                  set({ syncError: null })
                }
              })
            }
          },
          redo: () => {
            const syncRemote =
              remoteBoardPersistenceEnabled() &&
              getSupabaseClient() != null &&
              getDefaultBoardId() != null
            const client = getSupabaseClient()
            const bid = getDefaultBoardId()

            let remoteRedo:
              | {
                  next: UndoableSnapshot
                  restFuture: UndoableSnapshot[]
                  currentClone: UndoableSnapshot
                  oldPast: UndoableSnapshot[]
                }
              | undefined

            set((state) => {
              if (state.futureSnapshots.length === 0) {
                return {}
              }
              const [next, ...restFuture] = state.futureSnapshots
              const currentClone = cloneUndoable(state)
              const oldPast = state.pastSnapshots
              if (syncRemote && client && bid) {
                remoteRedo = { next, restFuture, currentClone, oldPast }
              }
              return {
                ...applySnapshot(next),
                pastSnapshots: [...state.pastSnapshots, currentClone],
                futureSnapshots: restFuture,
              }
            })

            if (remoteRedo && client && bid) {
              const { next, restFuture, currentClone, oldPast } = remoteRedo
              void reconcileRemoteTasks(
                client,
                bid,
                currentClone.tasks,
                next.tasks,
              ).then(({ error }) => {
                if (error) {
                  console.error("[supabase] redo reconcile", error)
                  set({
                    ...applySnapshot(currentClone),
                    pastSnapshots: oldPast,
                    futureSnapshots: [next, ...restFuture],
                    syncError: error.message,
                  })
                } else {
                  set({ syncError: null })
                }
              })
            }
          },
        }
      },
      {
        name: KANBAN_STORAGE_KEY,
        partialize: (state) =>
          remoteBoardPersistenceEnabled()
            ? { columnIds: state.columnIds }
            : {
                boardTitle: state.boardTitle,
                columnIds: state.columnIds,
                tasks: state.tasks,
              },
      },
    ),
    {
      name: "KanbanStore",
      enabled: import.meta.env.DEV,
    },
  ),
)
