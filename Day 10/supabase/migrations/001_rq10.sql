-- Day 10 React Query lab: workspace, tasks, comments, and a single user stub for parallel queries.
-- Run in the Supabase SQL editor (or supabase db push) before using the app with VITE_SUPABASE_* set.
-- Default workspace id must match VITE_RQ10_WORKSPACE_ID in .env (or use the seed value below).

CREATE TABLE public.rq10_workspaces (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.rq10_user_stub (
  id uuid PRIMARY KEY,
  display_name text NOT NULL,
  email text NOT NULL
);

CREATE TABLE public.rq10_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.rq10_workspaces (id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done')),
  assignee text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rq10_tasks_workspace_created_idx ON public.rq10_tasks (workspace_id, created_at DESC);

CREATE TABLE public.rq10_task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.rq10_tasks (id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.rq10_set_tasks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER rq10_tasks_set_updated_at
BEFORE UPDATE ON public.rq10_tasks
FOR EACH ROW
EXECUTE PROCEDURE public.rq10_set_tasks_updated_at();

-- Fixed demo workspace (copy to VITE_RQ10_WORKSPACE_ID)
INSERT INTO public.rq10_workspaces (id, name)
VALUES (
  '20000000-0000-4000-8000-000000000001',
  'Day 10 workspace'
);

INSERT INTO public.rq10_user_stub (id, display_name, email)
VALUES (
  '20000000-0000-4000-8000-000000000002',
  'Demo teammate',
  'demo@example.com'
);

INSERT INTO public.rq10_tasks (id, workspace_id, title, status, assignee, created_at)
SELECT
  gen_random_uuid(),
  '20000000-0000-4000-8000-000000000001',
  t.title,
  t.status,
  t.assignee,
  now() - (t.offs * interval '1 day')
FROM (VALUES
  ('Wire Supabase to React Query', 'in_progress', 'You', 0),
  ('Add optimistic PATCH with rollback', 'open', 'You', 1),
  ('Prefetch on hover in task list', 'open', NULL, 2),
  ('Parallel queries in header strip', 'done', 'Alex', 3),
  ('Dependent comments query', 'open', 'Alex', 4),
  ('Custom invalidation strategies', 'in_progress', 'You', 5),
  ('Infinite list with useInfiniteQuery', 'open', 'Sam', 6),
  ('Cache lab (invalidate + reset)', 'open', 'Sam', 7),
  ('Global error banner', 'open', NULL, 8),
  ('Error boundary on detail panel', 'open', 'You', 9),
  ('Zod at API boundary', 'done', 'Alex', 10),
  ('Background refetch interval', 'open', 'You', 11),
  ('Row-level security smoke test', 'open', 'You', 12),
  ('Document env in README', 'in_progress', 'Sam', 13),
  ('Review query key factories', 'done', 'Alex', 14)
) AS t(title, status, assignee, offs);

-- Comments for two tasks (for dependent-query demos)
INSERT INTO public.rq10_task_comments (task_id, body, created_at)
SELECT t.id, v.body, v.created_at
FROM public.rq10_tasks t
CROSS JOIN (VALUES
  ('Wire Supabase to React Query', 'Kicking off the thread', now() - interval '2 hours'),
  ('Wire Supabase to React Query', 'We can use list invalidation on settle', now() - interval '1 hour'),
  ('Wire Supabase to React Query', 'Configure .env and run this migration in Supabase', now() - interval '5 minutes')
) AS v(task_title, body, created_at)
WHERE t.workspace_id = '20000000-0000-4000-8000-000000000001'
  AND t.title = v.task_title;

INSERT INTO public.rq10_task_comments (task_id, body, created_at)
SELECT t.id, v.body, v.created_at
FROM public.rq10_tasks t
CROSS JOIN (VALUES
  ('Add optimistic PATCH with rollback', 'onMutate snapshot works', now() - interval '90 minutes'),
  ('Add optimistic PATCH with rollback', 'onError rolls back the cache', now() - interval '20 minutes')
) AS v(task_title, body, created_at)
WHERE t.workspace_id = '20000000-0000-4000-8000-000000000001'
  AND t.title = v.task_title;

ALTER TABLE public.rq10_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rq10_user_stub ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rq10_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rq10_task_comments ENABLE ROW LEVEL SECURITY;

-- Dev-only: same fixed workspace as Day 8-style demo. Tighten before production.
CREATE POLICY rq10_workspaces_demo
  ON public.rq10_workspaces
  FOR ALL
  TO anon, authenticated
  USING (id = '20000000-0000-4000-8000-000000000001'::uuid)
  WITH CHECK (id = '20000000-0000-4000-8000-000000000001'::uuid);

CREATE POLICY rq10_user_stub_demo
  ON public.rq10_user_stub
  FOR ALL
  TO anon, authenticated
  USING (id = '20000000-0000-4000-8000-000000000002'::uuid)
  WITH CHECK (id = '20000000-0000-4000-8000-000000000002'::uuid);

CREATE POLICY rq10_tasks_demo
  ON public.rq10_tasks
  FOR ALL
  TO anon, authenticated
  USING (workspace_id = '20000000-0000-4000-8000-000000000001'::uuid)
  WITH CHECK (workspace_id = '20000000-0000-4000-8000-000000000001'::uuid);

CREATE POLICY rq10_task_comments_demo
  ON public.rq10_task_comments
  FOR ALL
  TO anon, authenticated
  USING (
    task_id IN (
      SELECT id FROM public.rq10_tasks
      WHERE workspace_id = '20000000-0000-4000-8000-000000000001'::uuid
    )
  )
  WITH CHECK (
    task_id IN (
      SELECT id FROM public.rq10_tasks
      WHERE workspace_id = '20000000-0000-4000-8000-000000000001'::uuid
    )
  );
