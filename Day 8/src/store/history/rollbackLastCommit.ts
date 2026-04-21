import type { KanbanStore, UndoableSnapshot } from "../../types"

type SetState = (
  partial:
    | Partial<KanbanStore>
    | ((state: KanbanStore) => Partial<KanbanStore> | KanbanStore),
) => void

export function buildRollbackLastCommit(
  set: SetState,
  applySnapshot: (
    snapshot: UndoableSnapshot,
  ) => Pick<KanbanStore, "boardTitle" | "columnIds" | "tasks">,
): () => void {
  return () => {
    set((state) => {
      if (state.pastSnapshots.length === 0) {
        return {}
      }
      const previous = state.pastSnapshots[state.pastSnapshots.length - 1]!
      return {
        ...applySnapshot(previous),
        pastSnapshots: state.pastSnapshots.slice(0, -1),
        activityLog: state.activityLog.slice(0, -1),
        futureSnapshots: [],
      }
    })
  }
}
