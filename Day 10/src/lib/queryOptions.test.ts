import { describe, expect, it, vi } from 'vitest'
import {
  cycleStatus,
  tasksInfinite,
  taskDetail,
  taskComments,
  userMe,
  workspaceSummary,
  workspaceStats,
  TASKS_PAGE_SIZE,
} from './queryOptions'
import { TEST_WORKSPACE_ID, makeTaskPage } from '../test/fixtures'

vi.mock('../api/unified', () => ({
  getWorkspaceId: () => TEST_WORKSPACE_ID,
  listTasksPage: vi.fn(),
  getTask: vi.fn(),
  getTaskComments: vi.fn(),
  getUserProfile: vi.fn(),
  getWorkspace: vi.fn(),
  getWorkspaceStats: vi.fn(),
  createTaskLocal: vi.fn(),
  patchTaskRemote: vi.fn(),
}))

describe('cycleStatus', () => {
  it('advances open → in_progress', () => {
    expect(cycleStatus('open')).toBe('in_progress')
  })

  it('advances in_progress → done', () => {
    expect(cycleStatus('in_progress')).toBe('done')
  })

  it('wraps done → open', () => {
    expect(cycleStatus('done')).toBe('open')
  })
})

describe('tasksInfinite', () => {
  it('returns queryKey with workspace and pageSize', () => {
    const opts = tasksInfinite(8)
    expect(opts.queryKey).toEqual(['tasks', TEST_WORKSPACE_ID, 'infinite', 8])
  })

  it('uses TASKS_PAGE_SIZE as default pageSize', () => {
    const defaultOpts = tasksInfinite()
    const explicitOpts = tasksInfinite(TASKS_PAGE_SIZE)
    expect(defaultOpts.queryKey).toEqual(explicitOpts.queryKey)
  })

  it('getNextPageParam returns nextCursor when present', () => {
    const opts = tasksInfinite(8)
    const page = makeTaskPage({ nextCursor: 42 })
    expect(opts.getNextPageParam(page, [], null, [])).toBe(42)
  })

  it('getNextPageParam returns null when no more pages', () => {
    const opts = tasksInfinite(8)
    const page = makeTaskPage({ nextCursor: null })
    expect(opts.getNextPageParam(page, [], null, [])).toBeNull()
  })
})

describe('taskDetail', () => {
  it('queryKey includes task id and workspace', () => {
    const opts = taskDetail('task-abc')
    expect(opts.queryKey).toEqual(['tasks', TEST_WORKSPACE_ID, 'detail', 'task-abc'])
  })

  it('staleTime is set to a non-zero value', () => {
    const opts = taskDetail('task-abc')
    expect(opts.staleTime).toBeGreaterThan(0)
  })
})

describe('taskComments', () => {
  it('enabled is true when taskId is non-empty', () => {
    const opts = taskComments('task-abc')
    expect(opts.enabled).toBe(true)
  })

  it('enabled is false when taskId is empty string', () => {
    const opts = taskComments('')
    expect(opts.enabled).toBe(false)
  })

  it('queryKey includes taskId and workspace', () => {
    const opts = taskComments('task-abc')
    expect(opts.queryKey).toEqual(['tasks', TEST_WORKSPACE_ID, 'comments', 'task-abc'])
  })
})

describe('userMe', () => {
  it('queryKey is ["user", "me"]', () => {
    expect(userMe().queryKey).toEqual(['user', 'me'])
  })

  it('staleTime is set to a non-zero value', () => {
    expect(userMe().staleTime).toBeGreaterThan(0)
  })
})

describe('workspaceSummary', () => {
  it('queryKey includes workspace id', () => {
    const opts = workspaceSummary()
    expect(opts.queryKey).toEqual(['workspace', 'summary', TEST_WORKSPACE_ID])
  })

  it('staleTime is set to a non-zero value', () => {
    expect(workspaceSummary().staleTime).toBeGreaterThan(0)
  })
})

describe('workspaceStats', () => {
  it('default staleTime is 15000ms', () => {
    expect(workspaceStats().staleTime).toBe(15_000)
  })

  it('default refetchInterval is 20000ms', () => {
    expect(workspaceStats().refetchInterval).toBe(20_000)
  })

  it('accepts custom staleTime override', () => {
    const opts = workspaceStats({ staleTime: 5_000, refetchInterval: 10_000 })
    expect(opts.staleTime).toBe(5_000)
  })

  it('accepts custom refetchInterval override', () => {
    const opts = workspaceStats({ staleTime: 5_000, refetchInterval: 10_000 })
    expect(opts.refetchInterval).toBe(10_000)
  })

  it('queryKey includes workspace id', () => {
    const opts = workspaceStats()
    expect(opts.queryKey).toEqual(['workspace', 'stats', TEST_WORKSPACE_ID])
  })
})
