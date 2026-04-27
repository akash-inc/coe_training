/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Defaults to the UUID seeded in `supabase/migrations/001_rq10.sql` */
  readonly VITE_RQ10_WORKSPACE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
