-- Day 8 Kanban: boards + tasks (board-scoped for future RLS / multi-user).
-- Default board id must match VITE_DEFAULT_BOARD_ID in .env
-- Reference time aligns with createKanbanInitialData() demo metrics (2026-04-21).

CREATE TABLE public.boards (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  owner_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY,
  board_id uuid NOT NULL REFERENCES public.boards (id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  kanban_column text NOT NULL CHECK (
    kanban_column IN ('To Do', 'In Progress', 'Review', 'Done')
  ),
  created_at timestamptz NOT NULL,
  due_date timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tasks_board_id_idx ON public.tasks (board_id);

CREATE OR REPLACE FUNCTION public.set_tasks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tasks_set_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE PROCEDURE public.set_tasks_updated_at();

-- Seed board (fixed UUID — copy to VITE_DEFAULT_BOARD_ID)
INSERT INTO public.boards (id, title)
VALUES (
  '10000000-0000-4000-8000-000000000001',
  'zustand kanban board'
);

-- ref = same anchor as createKanbanInitialData(referenceTimeMs)
-- t_prev_created = ref - 10d - 3d - 8h ; t_cur_created = ref - 2d - 3d - 8h
INSERT INTO public.tasks (
  id,
  board_id,
  title,
  content,
  kanban_column,
  created_at,
  due_date,
  completed_at
)
VALUES
  (
    '10000000-0000-4000-8000-000000010001',
    '10000000-0000-4000-8000-000000000001',
    'Fix login bug',
    'Users get signed out after refresh.',
    'To Do',
    timestamptz '2026-04-21 15:00:00+00' - interval '45 days',
    timestamptz '2026-04-21 15:00:00+00' - interval '1 day',
    NULL
  ),
  (
    '10000000-0000-4000-8000-000000010002',
    '10000000-0000-4000-8000-000000000001',
    'Implement Zustand slices',
    'Split board, tasks, users, filters.',
    'In Progress',
    timestamptz '2026-04-21 15:00:00+00' - interval '40 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-000000010003',
    '10000000-0000-4000-8000-000000000001',
    'Add optimistic updates',
    'Rollback state when API call fails.',
    'Review',
    timestamptz '2026-04-21 15:00:00+00' - interval '38 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-000000010004',
    '10000000-0000-4000-8000-000000000001',
    'Create project scaffold',
    'Base app and test setup completed.',
    'Done',
    timestamptz '2026-04-21 15:00:00+00' - interval '10 days' - interval '3 days' - interval '8 hours',
    NULL,
    timestamptz '2026-04-21 15:00:00+00' - interval '10 days'
  ),
  (
    '10000000-0000-4000-8000-000000010005',
    '10000000-0000-4000-8000-000000000001',
    'Add analytics dashboard',
    'Show completion %, overdue, avg time, trend.',
    'Done',
    timestamptz '2026-04-21 15:00:00+00' - interval '2 days' - interval '3 days' - interval '8 hours',
    NULL,
    timestamptz '2026-04-21 15:00:00+00' - interval '2 days'
  ),
  (
    '10000000-0000-4000-8000-000000010006',
    '10000000-0000-4000-8000-000000000001',
    'Wire up React Router',
    'Board route, lazy-loaded settings, 404 fallback.',
    'Done',
    timestamptz '2026-04-21 15:00:00+00' - interval '10 days' - interval '3 days' - interval '8 hours',
    NULL,
    timestamptz '2026-04-21 15:00:00+00' - interval '10 days'
  ),
  (
    '10000000-0000-4000-8000-000000010007',
    '10000000-0000-4000-8000-000000000001',
    'Draft accessibility checklist',
    'Focus order, labels, and reduced-motion behavior.',
    'To Do',
    timestamptz '2026-04-21 15:00:00+00' - interval '12 days',
    timestamptz '2026-04-21 15:00:00+00' - interval '2 days',
    NULL
  ),
  (
    '10000000-0000-4000-8000-000000010008',
    '10000000-0000-4000-8000-000000000001',
    'Document env variables',
    '.env.example plus README section for local dev.',
    'To Do',
    timestamptz '2026-04-21 15:00:00+00' - interval '10 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-000000010009',
    '10000000-0000-4000-8000-000000000001',
    'Smoke test drag-and-drop',
    'Cover To Do → In Progress → Review in Cypress.',
    'To Do',
    timestamptz '2026-04-21 15:00:00+00' - interval '9 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-00000001000a',
    '10000000-0000-4000-8000-000000000001',
    'Tighten ESLint config',
    'Align import order and hook rules with team defaults.',
    'To Do',
    timestamptz '2026-04-21 15:00:00+00' - interval '8 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-00000001000b',
    '10000000-0000-4000-8000-000000000001',
    'Prototype column WIP limits',
    'Soft cap with warning badge before hard block.',
    'In Progress',
    timestamptz '2026-04-21 15:00:00+00' - interval '7 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-00000001000c',
    '10000000-0000-4000-8000-000000000001',
    'Normalize task timestamps',
    'Ensure moveTask sets completedAt only when entering Done.',
    'In Progress',
    timestamptz '2026-04-21 15:00:00+00' - interval '6 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-00000001000d',
    '10000000-0000-4000-8000-000000000001',
    'Sketch empty states',
    'Illustrations for zero tasks per column.',
    'In Progress',
    timestamptz '2026-04-21 15:00:00+00' - interval '5 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-00000001000e',
    '10000000-0000-4000-8000-000000000001',
    'Review error boundaries',
    'Board-level boundary plus per-column fallback copy.',
    'Review',
    timestamptz '2026-04-21 15:00:00+00' - interval '11 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-00000001000f',
    '10000000-0000-4000-8000-000000000001',
    'Audit bundle size',
    'Compare main chunk before/after dashboard chunk.',
    'Review',
    timestamptz '2026-04-21 15:00:00+00' - interval '4 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-000000010010',
    '10000000-0000-4000-8000-000000000001',
    'Localization pass',
    'Extract column labels and dashboard strings to i18n map.',
    'Review',
    timestamptz '2026-04-21 15:00:00+00' - interval '3 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-000000010011',
    '10000000-0000-4000-8000-000000000001',
    'Ship keyboard shortcuts help',
    'Modal listing ? for shortcuts and Esc to close.',
    'Done',
    timestamptz '2026-04-21 15:00:00+00' - interval '10 days' - interval '3 days' - interval '8 hours',
    NULL,
    timestamptz '2026-04-21 15:00:00+00' - interval '10 days'
  ),
  (
    '10000000-0000-4000-8000-000000010012',
    '10000000-0000-4000-8000-000000000001',
    'Hook up persist middleware',
    'Zustand persist with partialize for board + tasks.',
    'Done',
    timestamptz '2026-04-21 15:00:00+00' - interval '2 days' - interval '3 days' - interval '8 hours',
    NULL,
    timestamptz '2026-04-21 15:00:00+00' - interval '2 days'
  ),
  (
    '10000000-0000-4000-8000-000000010013',
    '10000000-0000-4000-8000-000000000001',
    'Backfill unit tests for metrics',
    'Trend window edges and overdue when dueDate is null.',
    'To Do',
    timestamptz '2026-04-21 15:00:00+00' - interval '2 days',
    NULL,
    NULL
  ),
  (
    '10000000-0000-4000-8000-000000010014',
    '10000000-0000-4000-8000-000000000001',
    'Polish dashboard spacing',
    'Match board rhythm: labels, gaps, and heading scale.',
    'To Do',
    timestamptz '2026-04-21 15:00:00+00' - interval '1 day',
    NULL,
    NULL
  );

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Dev-only: anon can read/write only the seeded demo board.
-- Replace with auth.uid() / board_members policies before production or public deploy.
CREATE POLICY boards_demo_isolation
  ON public.boards
  FOR ALL
  TO anon, authenticated
  USING (id = '10000000-0000-4000-8000-000000000001'::uuid)
  WITH CHECK (id = '10000000-0000-4000-8000-000000000001'::uuid);

CREATE POLICY tasks_demo_isolation
  ON public.tasks
  FOR ALL
  TO anon, authenticated
  USING (board_id = '10000000-0000-4000-8000-000000000001'::uuid)
  WITH CHECK (board_id = '10000000-0000-4000-8000-000000000001'::uuid);
