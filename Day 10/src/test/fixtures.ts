import type { Task, TaskComment, TaskPage, UserProfile, WorkspaceSummary, WorkspaceStats } from '../api/schemas'

export const TEST_WORKSPACE_ID = '20000000-0000-4000-8000-000000000001'
export const TEST_TASK_ID_1 = '10000000-0000-4000-8000-000000000001'
export const TEST_TASK_ID_2 = '10000000-0000-4000-8000-000000000002'

export const makeTask = (overrides?: Partial<Task>): Task => ({
  id: TEST_TASK_ID_1,
  title: 'Fix the login bug',
  status: 'open',
  assignee: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

export const makeTaskPage = (overrides?: { items?: Task[]; nextCursor?: number | null }): TaskPage => ({
  items: overrides?.items ?? [makeTask()],
  nextCursor: overrides?.nextCursor ?? null,
})

export const makeTaskComment = (overrides?: Partial<TaskComment>): TaskComment => ({
  id: '30000000-0000-4000-8000-000000000001',
  taskId: TEST_TASK_ID_1,
  body: 'This is a comment',
  createdAt: '2025-01-01T12:00:00.000Z',
  ...overrides,
})

export const makeUserProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  id: '40000000-0000-4000-8000-000000000001',
  displayName: 'Alice Tester',
  email: 'alice@example.com',
  ...overrides,
})

export const makeWorkspaceSummary = (overrides?: Partial<WorkspaceSummary>): WorkspaceSummary => ({
  id: TEST_WORKSPACE_ID,
  name: 'Test Workspace',
  ...overrides,
})

export const makeWorkspaceStats = (overrides?: Partial<WorkspaceStats>): WorkspaceStats => ({
  open: 3,
  inProgress: 2,
  done: 5,
  ...overrides,
})
