import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import {
  createTaskLocal,
  getTask,
  getTaskComments,
  getUserProfile,
  getWorkspace,
  getWorkspaceId,
  getWorkspaceStats,
  listTasksPage,
  patchTaskRemote,
} from '../api/unified'
import { taskKeys, userKeys, workspaceKeys } from './queryKeys'
import type { Task, TaskStatus } from '../api/schemas'

export const TASKS_PAGE_SIZE = 8
const STALE = 1000 * 60 * 2
const ws = () => getWorkspaceId()

export const tasksInfinite = (pageSize: number = TASKS_PAGE_SIZE) =>
  infiniteQueryOptions({
    queryKey: taskKeys.infinite(pageSize, ws()),
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as number | null
      return listTasksPage(pageSize, cursor)
    },
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor,
    staleTime: STALE,
    meta: { label: 'Task list (paged)' } as const,
  })

export const taskDetail = (id: string) =>
  queryOptions({
    queryKey: taskKeys.detail(id, ws()),
    queryFn: () => getTask(id),
    staleTime: STALE,
    meta: { label: `Task ${id}` } as const,
  })

export const taskComments = (taskId: string) =>
  queryOptions({
    queryKey: taskKeys.comments(taskId, ws()),
    queryFn: () => getTaskComments(taskId),
    enabled: taskId.length > 0,
    staleTime: STALE,
    meta: { label: 'Task comments' } as const,
  })

export const userMe = () =>
  queryOptions({
    queryKey: userKeys.me(),
    queryFn: () => getUserProfile(),
    staleTime: STALE,
  })

export const workspaceSummary = () => {
  const id = getWorkspaceId()
  return queryOptions({
    queryKey: workspaceKeys.summary(id),
    queryFn: () => getWorkspace(),
    staleTime: STALE,
  })
}

export const workspaceStats = (options?: { refetchInterval: number | false; staleTime: number }) =>
  queryOptions({
    queryKey: workspaceKeys.stats(getWorkspaceId()),
    queryFn: () => getWorkspaceStats(),
    staleTime: options?.staleTime ?? 1000 * 15,
    refetchInterval: options?.refetchInterval ?? 1000 * 20,
  })

export function cycleStatus(s: TaskStatus): TaskStatus {
  if (s === 'open') {
    return 'in_progress'
  }
  if (s === 'in_progress') {
    return 'done'
  }
  return 'open'
}

export { createTaskLocal, getWorkspaceId, patchTaskRemote, listTasksPage }

export type { Task, TaskStatus }
