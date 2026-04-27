import { getWorkspaceId } from '../api/unified'

/**
 * Key factories for TanStack Query. Keys include `workspaceId` so predicate invalidation can target one scope.
 */
export const taskKeys = {
  all: (workspaceId: string = getWorkspaceId()) => ['tasks', workspaceId] as const,
  /** Prefix match for all task queries in this workspace: ['tasks', ws] */
  rootPrefix: (workspaceId: string = getWorkspaceId()) => ['tasks', workspaceId] as const,
  infinite: (pageSize: number, workspaceId: string = getWorkspaceId()) =>
    ['tasks', workspaceId, 'infinite', pageSize] as const,
  detail: (id: string, workspaceId: string = getWorkspaceId()) =>
    ['tasks', workspaceId, 'detail', id] as const,
  comments: (id: string, workspaceId: string = getWorkspaceId()) =>
    ['tasks', workspaceId, 'comments', id] as const,
} as const

export const userKeys = {
  me: () => ['user', 'me'] as const,
} as const

export const workspaceKeys = {
  summary: (id: string) => ['workspace', 'summary', id] as const,
  stats: (id: string) => ['workspace', 'stats', id] as const,
} as const
