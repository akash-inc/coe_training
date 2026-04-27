import type { ReactNode } from 'react'
import { isSupabaseConfigured } from '../lib/supabase/client'

export function SupabaseRequired({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured()) {
    return children
  }
  return (
    <div className="supabase-required" role="alert">
      <h1>Supabase configuration required</h1>
      <p>
        This app reads and writes your Postgres database through Supabase. Add your project URL
        and anon key to a <code>.env</code> file (see <code>.env.example</code> in this folder), then
        run the SQL in <code>supabase/migrations/001_rq10.sql</code> in the Supabase SQL editor. Restart
        the dev server after changing env.
      </p>
    </div>
  )
}
