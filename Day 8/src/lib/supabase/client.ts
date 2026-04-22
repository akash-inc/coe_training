import { createClient, type LockFunc, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

/**
 * GoTrue’s default is `navigatorLock` (Web Locks API). In dev, React Strict
 * Mode plus overlapping auth calls (getSession, onAuthStateChange, signOut) can
 * orphan or steal the lock and throw `NavigatorLockAcquireTimeoutError`. This
 * app uses a single tab and one client instance; a no-op lock avoids that
 * class of failures while in-process auth remains serialized per client.
 * @see https://github.com/supabase/gotrue-js/blob/master/src/GoTrueClient.ts
 */
const authLockNoOp: LockFunc = async (_name, _acquireTimeout, fn) => fn()

let client: SupabaseClient<Database> | null = null

function envTrim(value: string | undefined): string {
  return value == null ? "" : value.trim()
}

export function isSupabaseConfigured(): boolean {
  const url = envTrim(import.meta.env.VITE_SUPABASE_URL)
  const key = envTrim(import.meta.env.VITE_SUPABASE_ANON_KEY)
  return url.length > 0 && key.length > 0
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null
  }
  if (!client) {
    client = createClient<Database>(
      envTrim(import.meta.env.VITE_SUPABASE_URL),
      envTrim(import.meta.env.VITE_SUPABASE_ANON_KEY),
      {
        auth: {
          lock: authLockNoOp,
        },
      },
    )
  }
  return client
}

export function getDefaultBoardId(): string | null {
  const id = envTrim(import.meta.env.VITE_DEFAULT_BOARD_ID)
  return id.length > 0 ? id : null
}

export function isRemoteBoardPersistenceEnabled(): boolean {
  return isSupabaseConfigured() && getDefaultBoardId() != null
}
