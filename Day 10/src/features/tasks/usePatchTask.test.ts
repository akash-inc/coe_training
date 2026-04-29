import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { usePatchTask } from './usePatchTask'
import { taskKeys, workspaceKeys } from '../../lib/queryKeys'
import {
  TEST_WORKSPACE_ID,
  TEST_TASK_ID_1,
  makeTask,
  makeTaskPage,
} from '../../test/fixtures'
import type { Task, TaskPage } from '../../api/schemas'
import { patchTaskRemote } from '../../api/unified'

// Hook tests need gcTime > 0 so optimistic data isn't GC'd between setQueryData and waitFor
function makeHookQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

vi.mock('../../api/unified', () => ({
  getWorkspaceId: () => TEST_WORKSPACE_ID,
  patchTaskRemote: vi.fn(),
  listTasksPage: vi.fn(),
  getTask: vi.fn(),
  getTaskComments: vi.fn(),
  getUserProfile: vi.fn(),
  getWorkspace: vi.fn(),
  getWorkspaceStats: vi.fn(),
  createTaskLocal: vi.fn(),
}))

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('usePatchTask', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = makeHookQueryClient()
    vi.mocked(patchTaskRemote).mockResolvedValue(makeTask({ status: 'in_progress' }))
  })

  afterEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  describe('happy path', () => {
    it('calls patchTaskRemote with the task id and cycled status', async () => {
      const task = makeTask({ status: 'open' })
      const { result } = renderHook(() => usePatchTask(), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        await result.current.mutateAsync(task)
      })

      expect(vi.mocked(patchTaskRemote)).toHaveBeenCalledWith(task.id, { status: 'in_progress' })
    })

    it('applies optimistic update to detail cache immediately (before mutation settles)', async () => {
      const task = makeTask({ status: 'open' })
      queryClient.setQueryData(taskKeys.detail(task.id, TEST_WORKSPACE_ID), task)

      // Use a controlled promise so we can check cache state before onSettled clears it
      let resolvePatch!: (value: Task) => void
      vi.mocked(patchTaskRemote).mockImplementation(
        () => new Promise((resolve) => { resolvePatch = resolve }),
      )

      const { result } = renderHook(() => usePatchTask(), {
        wrapper: makeWrapper(queryClient),
      })

      // Start mutation without awaiting — onMutate runs synchronously up to cancelQueries
      act(() => {
        void result.current.mutateAsync(task)
      })

      // Optimistic state should be visible after onMutate completes
      await waitFor(() => {
        const cached = queryClient.getQueryData<Task>(taskKeys.detail(task.id, TEST_WORKSPACE_ID))
        expect(cached?.status).toBe('in_progress')
      })

      // Let the mutation finish cleanly
      await act(async () => { resolvePatch(makeTask({ status: 'in_progress' })) })
    })

    it('applies optimistic update to infinite list cache (before mutation settles)', async () => {
      const task = makeTask({ id: TEST_TASK_ID_1, status: 'open' })
      const infiniteKey = taskKeys.infinite(8, TEST_WORKSPACE_ID)
      const infiniteData: InfiniteData<TaskPage> = {
        pages: [makeTaskPage({ items: [task] })],
        pageParams: [null],
      }
      queryClient.setQueryData(infiniteKey, infiniteData)

      let resolvePatch!: (value: Task) => void
      vi.mocked(patchTaskRemote).mockImplementation(
        () => new Promise((resolve) => { resolvePatch = resolve }),
      )

      const { result } = renderHook(() => usePatchTask(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        void result.current.mutateAsync(task)
      })

      await waitFor(() => {
        const cached = queryClient.getQueryData<InfiniteData<TaskPage>>(infiniteKey)
        expect(cached?.pages[0].items[0].status).toBe('in_progress')
      })

      await act(async () => { resolvePatch(makeTask({ status: 'in_progress' })) })
    })

    it('invalidates taskKeys.all on settled', async () => {
      const task = makeTask({ status: 'open' })
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => usePatchTask(), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        await result.current.mutateAsync(task)
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith(
          expect.objectContaining({ queryKey: taskKeys.all(TEST_WORKSPACE_ID) }),
        )
      })
    })

    it('invalidates workspaceKeys.stats on settled', async () => {
      const task = makeTask({ status: 'open' })
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => usePatchTask(), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        await result.current.mutateAsync(task)
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith(
          expect.objectContaining({ queryKey: workspaceKeys.stats(TEST_WORKSPACE_ID) }),
        )
      })
    })
  })

  describe('error path (rollback)', () => {
    beforeEach(() => {
      vi.mocked(patchTaskRemote).mockRejectedValue(new Error('network failure'))
    })

    it('restores the detail cache when the mutation fails', async () => {
      const task = makeTask({ status: 'open' })
      queryClient.setQueryData(taskKeys.detail(task.id, TEST_WORKSPACE_ID), task)

      const { result } = renderHook(() => usePatchTask(), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        try {
          await result.current.mutateAsync(task)
        } catch {
          // expected rejection
        }
      })

      await waitFor(() => {
        const cached = queryClient.getQueryData<Task>(taskKeys.detail(task.id, TEST_WORKSPACE_ID))
        expect(cached?.status).toBe('open')
      })
    })

    it('restores the infinite list cache when the mutation fails', async () => {
      const task = makeTask({ id: TEST_TASK_ID_1, status: 'open' })
      const infiniteKey = taskKeys.infinite(8, TEST_WORKSPACE_ID)
      const infiniteData: InfiniteData<TaskPage> = {
        pages: [makeTaskPage({ items: [task] })],
        pageParams: [null],
      }
      queryClient.setQueryData(infiniteKey, infiniteData)

      const { result } = renderHook(() => usePatchTask(), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        try {
          await result.current.mutateAsync(task)
        } catch {
          // expected rejection
        }
      })

      await waitFor(() => {
        const cached = queryClient.getQueryData<InfiniteData<TaskPage>>(infiniteKey)
        expect(cached?.pages[0].items[0].status).toBe('open')
      })
    })
  })
})
