# Supabase setup (Day 8 Kanban)

This app can run **offline** (no env vars): tasks stay in memory / localStorage. With Supabase configured, tasks load from Postgres and mutations use **optimistic updates** with **rollback** on request failure.

## 1. Create a project

Create a project at [supabase.com](https://supabase.com) and open **SQL Editor**.

## 2. Run the migration

Paste and run the contents of [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql).

This creates:

- `boards` (with nullable `owner_id` for future auth)
- `tasks` scoped by `board_id` (ready for per-board RLS)
- Seed data for the demo board `10000000-0000-4000-8000-000000000001`
- **Dev RLS** policies restricted to that board only for `anon` / `authenticated`

Replace those policies with `auth.uid()` / membership checks before any production or public deployment.

## 3. Environment variables

Put the file in the **Day 8 project root** (next to `package.json` and `vite.config.ts`). Vite only reads names that start with `VITE_`.

Copy [`.env.example`](.env.example) to **`.env`** or **`.env.local`** (either works; `.env.local` overrides `.env` when both exist):

- `VITE_SUPABASE_URL` — Project Settings → API → URL (no trailing slash)  
- `VITE_SUPABASE_ANON_KEY` — Project Settings → API → `anon` `public`  
- `VITE_DEFAULT_BOARD_ID` — must match the seeded board UUID in the migration (`10000000-0000-4000-8000-000000000001`)

Do not wrap values in quotes unless the value itself contains spaces. Restart `npm run dev` after any change.

**If the app still behaves offline:** confirm you are running the dev server from this folder (`cd "Day 8" && npm run dev`). The Vite config pins `envDir` to that directory so `.env` is found even when tooling changes the working directory.

## 4. Behaviour

- On load, the app calls `hydrateFromRemote()` and replaces local tasks with server rows (undo history is cleared).
- **Persist**: when Supabase is configured, only `columnIds` are written to `localStorage` (not `tasks` / `boardTitle`) so the server stays the source of truth.
- **resetBoard**: refetches the board from Supabase and clears undo history (no server-side delete-all).
- **Undo / redo** (with Supabase): the UI updates immediately, then `reconcileRemoteTasks` applies the same task diff to Postgres (deletes, inserts, updates in order). If reconciliation fails, the history step is rolled back locally and `syncError` is set (same pattern as failed task mutations).
- New task IDs must be valid UUIDs (the add-task form uses `crypto.randomUUID()`).

## 5. Tests

Vitest is configured with empty `VITE_SUPABASE_*` env vars so unit tests stay **offline** and deterministic. Rollback behavior is covered in [`src/store/history/rollbackLastCommit.test.ts`](src/store/history/rollbackLastCommit.test.ts).

## 6. Multi-user follow-up

- Add Supabase Auth and set `boards.owner_id` (or a `board_members` table).
- Tighten RLS so users only see boards they own or belong to.
- Optionally add Realtime on `tasks` for live updates across clients.
