# Day 8 — Zustand Kanban Board

A training project: **React 19** + **TypeScript** + **Vite** Kanban board backed by **Zustand** (`persist`, `devtools`), with optional **Supabase** (Postgres) sync, **undo/redo**, an **activity log**, and a small **analytics dashboard**.

## Requirements

- Node.js 20+ recommended
- npm (or compatible client)

## Quick start

```bash
cd "Day 8"
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

**Without Supabase:** Leave `VITE_SUPABASE_*` unset (or use empty values). The app uses generated seed data from [`src/store/initialData.ts`](src/store/initialData.ts) and persists board state to **localStorage** under the key `day-8-kanban`.

## npm scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | `tsc -b` then production bundle |
| `npm run preview` | Serve the production build |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |
| `npm run lint` | ESLint |

## What’s in the app

### Board

- **Columns:** To Do, In Progress, Review, Done (`ColumnId` in [`src/types/board.ts`](src/types/board.ts)).
- **Tasks:** Add ([`AddTaskForm.tsx`](src/components/Board/AddTaskForm.tsx)), edit inline, delete, **HTML5 drag-and-drop** between columns ([`Board.tsx`](src/components/Board/Board.tsx), [`Column.tsx`](src/components/Board/Column.tsx), [`TaskCard.tsx`](src/components/Board/TaskCard.tsx)).
- **Done column:** Moving a task to Done sets `completedAt`; moving it out clears `completedAt` ([`tasksSlice.ts`](src/store/slices/tasksSlice.ts)).

### Dashboard

[`Dashboard.tsx`](src/components/Dashboard/Dashboard.tsx) shows metrics from [`src/lib/analytics/dashboardMetrics.ts`](src/lib/analytics/dashboardMetrics.ts):

- Total / active / completed / overdue counts, completion rate
- Average lead time (created → completed) for Done tasks with timestamps
- **Trend:** compares median lead time across **adjacent time periods** (default 7 days), with fallbacks so the UI always shows improving / declining / stable / em dash (no “insufficient data” copy)

### Recent activity and history

[`RecentActivity.tsx`](src/components/Board/RecentActivity.tsx):

- **Activity log** — newest-first list of committed actions (add, update, move, remove)
- **Undo / Redo** — snapshot-based; new commits clear the redo stack

### Sync error banner

When Supabase mutations or **undo/redo reconciliation** fails, [`Board.tsx`](src/components/Board/Board.tsx) shows an alert with `syncError` and a dismiss control (`clearSyncError`).

## State management (Zustand)

[`src/store/index.ts`](src/store/index.ts) defines `useKanbanStore`:

| Area | Details |
|------|---------|
| **Slices** | Board fields (`boardTitle`, `columnIds`), task CRUD actions, history (`pastSnapshots`, `futureSnapshots`, `activityLog`, `undo`, `redo`) |
| **Commits** | Undoable task changes go through `commit()`, which saves a snapshot, clears redo, and appends to `activityLog` |
| **Middleware** | `persist` (localStorage), `devtools` (dev only) |
| **Remote** | If Supabase env is set, [`createTasksActionsWithRemote`](src/store/slices/tasksSlice.ts) runs the API after each optimistic commit; failures call `rollbackLastCommit` ([`rollbackLastCommit.ts`](src/store/history/rollbackLastCommit.ts)) |
| **Selectors** | `Board` uses [`useShallow`](https://github.com/pmndrs/zustand) from `zustand/react/shallow` for one object-shaped subscription |
| **resetBoard** | Offline: reapplies fresh seed data. With Supabase: clears history and calls `hydrateFromRemote()` (no server-side mass delete) |

### Persistence rules

- **Supabase off:** `partialize` persists `boardTitle`, `columnIds`, `tasks`.
- **Supabase on:** only **`columnIds`** are persisted locally; `boardTitle` and `tasks` are loaded from the server after `hydrateFromRemote()`.

### Undo/redo and Supabase

After a local undo or redo, [`reconcileRemoteTasks`](src/lib/supabase/boardRemote.ts) applies a planned sequence of **delete / insert / update** so Postgres matches the new task list. On failure, the history step is **reverted locally** and `syncError` is set (same pattern as failed task mutations).

## Supabase backend (optional)

### 1. Create a project

[supabase.com](https://supabase.com) — note the project **reference** in the API URL.

### 2. Run the SQL migration

In the Supabase **SQL** editor, run the full file [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql).

It creates `public.boards` and `public.tasks`, seed data for board id `10000000-0000-4000-8000-000000000001`, enables **RLS**, and adds **demo-only** policies for `anon` / `authenticated` scoped to that board. Replace those policies before any real production use.

### 3. Environment variables

In the **Day 8** folder (next to `package.json`), copy [`.env.example`](.env.example) to **`.env`** or **`.env.local`**. Only names prefixed with `VITE_` are exposed to the browser.

| Variable | Meaning |
|----------|---------|
| `VITE_SUPABASE_URL` | Project URL from **Settings → API** (no trailing slash) |
| `VITE_SUPABASE_ANON_KEY` | **anon** `public` key (never put the service-role key here) |
| `VITE_DEFAULT_BOARD_ID` | Must match the seeded board UUID in the migration |

Restart `npm run dev` after edits. [`vite.config.ts`](vite.config.ts) sets `root` and `envDir` to this directory so `.env` resolves even if the shell cwd differs.

### 4. Runtime behaviour with Supabase

- [`App.tsx`](src/App.tsx) calls `hydrateFromRemote()` on mount when the client and default board id exist.
- New tasks use **`crypto.randomUUID()`** so ids match UUID columns in Postgres.
- Mapping between app `Task` and DB rows: [`taskRow.ts`](src/lib/supabase/taskRow.ts); generated types: [`database.types.ts`](src/lib/supabase/database.types.ts).

### 5. Troubleshooting

**JSON error `PGRST205` / HTTP 404 on `/rest/v1/boards`**

The API cannot see `public.boards` — usually the migration was not run on **this** project, or `VITE_SUPABASE_URL` points at a different project than where you ran the SQL. Confirm **Table editor** shows `boards` and `tasks`.

**App ignores `.env`**

Run `cd "Day 8" && npm run dev` from the app root.

**Tests**

Vitest sets `VITE_SUPABASE_*` to empty strings so tests stay offline ([`vite.config.ts`](vite.config.ts) `test.env`).

More Supabase-focused notes also live in [`README-SUPABASE.md`](README-SUPABASE.md) (pointer to this file for bookmarks).

## Repository layout

```
Day 8/
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── public/                 # favicon.svg, icons.svg
├── README.md
├── README-SUPABASE.md
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── App.css
    ├── App.test.tsx
    ├── main.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── test/
    │   └── setup.ts
    ├── types/
    │   ├── board.ts        # Task, TaskDraft, ColumnId
    │   ├── store.ts        # KanbanStore, UndoableSnapshot, activityEntry
    │   ├── column.ts
    │   ├── taskCard.ts
    │   └── index.ts
    ├── lib/
    │   ├── analytics/
    │   │   ├── dashboardMetrics.ts
    │   │   └── dashboardMetrics.test.ts
    │   └── supabase/
    │       ├── client.ts
    │       ├── boardRemote.ts
    │       ├── taskRow.ts
    │       ├── database.types.ts
    │       └── planTaskReconciliation.test.ts
    ├── store/
    │   ├── index.ts
    │   ├── index.test.ts
    │   ├── initialData.ts
    │   ├── actionHistory.test.ts
    │   ├── slices/
    │   │   └── tasksSlice.ts
    │   └── history/
    │       ├── cloneUndoable.ts
    │       ├── activityLog.ts
    │       ├── rollbackLastCommit.ts
    │       └── rollbackLastCommit.test.ts
    └── components/
        ├── Board/
        │   ├── Board.tsx
        │   ├── Board.css
        │   ├── Column.tsx
        │   ├── Column.css
        │   ├── TaskCard.tsx
        │   ├── TaskCard.css
        │   ├── AddTaskForm.tsx
        │   ├── AddTaskForm.css
        │   ├── RecentActivity.tsx
        │   └── RecentActivity.css
        └── Dashboard/
            ├── Dashboard.tsx
            └── Dashboard.css
```

## Testing

Tests use **Vitest**, **Testing Library**, and **jsdom**.

| File | Focus |
|------|--------|
| [`App.test.tsx`](src/App.test.tsx) | Board UI, dashboard text, drag, persist/rehydrate flow |
| [`store/index.test.ts`](src/store/index.test.ts) | Store actions, `resetBoard` |
| [`store/actionHistory.test.ts`](src/store/actionHistory.test.ts) | Activity log, undo/redo |
| [`store/history/rollbackLastCommit.test.ts`](src/store/history/rollbackLastCommit.test.ts) | Failed remote commit rollback |
| [`lib/analytics/dashboardMetrics.test.ts`](src/lib/analytics/dashboardMetrics.test.ts) | Metrics and trend |
| [`lib/supabase/planTaskReconciliation.test.ts`](src/lib/supabase/planTaskReconciliation.test.ts) | Undo/redo remote diff planning |

## Git and secrets

[`.gitignore`](.gitignore) ignores `.env` and `.env.*` except `.env.example`. Do not commit real API keys; rotate keys if they were ever committed.

## License / use

Training / private use — adjust for your organization.
