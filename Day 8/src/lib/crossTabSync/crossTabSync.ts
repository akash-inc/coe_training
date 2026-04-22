import { getSupabaseClient, isRemoteBoardPersistenceEnabled } from "../supabase/client"
import { KANBAN_PERSIST_KEY, KANBAN_REMOTE_SYNC_BUMP_KEY } from "../kanbanStorageKeys"

type PersistingStore = {
  persist: {
    rehydrate: () => Promise<void> | void
  }
  getState: () => { hydrateFromRemote: () => Promise<void> }
}

const storeRef: { current: PersistingStore | null } = { current: null }
let onStorage: ((e: StorageEvent) => void) | null = null
let started = false

export function connectKanbanCrossTabSync(store: PersistingStore) {
  if (typeof window === "undefined") {
    return
  }
  storeRef.current = store
  if (started) {
    return
  }
  started = true

  onStorage = (e: StorageEvent) => {
    if (e.storageArea != null && e.storageArea !== localStorage) {
      return
    }
    if (e.key === KANBAN_REMOTE_SYNC_BUMP_KEY) {
      if (e.newValue == null) {
        return
      }
      void pullRemoteStateAfterOtherTabWrote()
      return
    }
    if (e.key === KANBAN_PERSIST_KEY) {
      if (typeof e.newValue !== "string" || e.newValue === "") {
        return
      }
      const s = storeRef.current
      if (!s) {
        return
      }
      void s.persist.rehydrate()
    }
  }

  window.addEventListener("storage", onStorage)
}

function pullRemoteStateAfterOtherTabWrote() {
  const s = storeRef.current
  if (!s || !isRemoteBoardPersistenceEnabled()) {
    return
  }

  const run = () => {
    void s.getState().hydrateFromRemote()
  }

  const client = getSupabaseClient()
  if (!client) {
    run()
    return
  }

  void (async () => {
    const { data: sessionData } = await client.auth.getSession()
    if (sessionData.session != null) {
      run()
      return
    }
    let finished = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const finish = () => {
      if (finished) {
        return
      }
      finished = true
      run()
    }
    const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
      if (next != null) {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId)
        }
        sub.subscription.unsubscribe()
        finish()
      }
    })
    timeoutId = window.setTimeout(() => {
      sub.subscription.unsubscribe()
      finish()
    }, 3_000)
  })()
}

export function notifyKanbanChangedFromThisTab() {
  if (typeof localStorage === "undefined") {
    return
  }
  if (!isRemoteBoardPersistenceEnabled()) {
    return
  }
  try {
    const suffix =
      typeof globalThis.crypto !== "undefined" &&
      typeof globalThis.crypto.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : String(Math.random())
    localStorage.setItem(
      KANBAN_REMOTE_SYNC_BUMP_KEY,
      `${Date.now()}-${suffix}`,
    )
  } catch {}
}

export function __resetCrossTabSyncForTests() {
  if (typeof window === "undefined") {
    return
  }
  if (onStorage) {
    window.removeEventListener("storage", onStorage)
    onStorage = null
  }
  started = false
  storeRef.current = null
}
