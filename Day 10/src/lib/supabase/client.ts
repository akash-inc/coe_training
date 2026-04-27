import { createClient, type LockFunc, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const authLockNoOp: LockFunc = async (_name, _acquireTimeout, fn) => fn()

let client: SupabaseClient<Database> | null = null

function envTrim(value: string | undefined): string {
  return value == null ? '' : value.trim()
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
        auth: { lock: authLockNoOp },
      },
    )
  }
  return client
}

const DEFAULT_WORKSPACE = '20000000-0000-4000-8000-000000000001'

export function getRq10WorkspaceId(): string {
  const id = envTrim(import.meta.env.VITE_RQ10_WORKSPACE_ID)
  return id.length > 0 ? id : DEFAULT_WORKSPACE
}
