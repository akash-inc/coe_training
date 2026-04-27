import { getRq10WorkspaceId, getSupabaseClient } from '../lib/supabase/client'
import { consumeSimulatedWriteFailure } from '../lib/simulateWriteFailure'
import { ApiError } from './errors'
import type { Task, TaskComment, TaskPage, TaskStatus, UserProfile, WorkspaceStats, WorkspaceSummary } from './schemas'
import {
  createTaskSupabase,
  getTaskCommentsSupabase,
  getTaskSupabase,
  getUserProfileSupabase,
  getWorkspaceStatsSupabase,
  getWorkspaceSupabase,
  listTasksPageSupabase,
  patchTaskSupabase,
} from './supabase/rq10Api'

function requireSupabase() {
  const client = getSupabaseClient()
  if (!client) {
    throw new ApiError(
      'Supabase is not configured. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then run the Day 10 SQL migration in your project.',
      500,
    )
  }
  return client
}

function maybeThrowSimulatedWrite(): void {
  if (consumeSimulatedWriteFailure()) {
    throw new ApiError('Simulated write failure (toggle in Cache & debug)', 500)
  }
}

export function getWorkspaceId(): string {
  return getRq10WorkspaceId()
}

export async function listTasksPage(pageSize: number, cursor: number | null): Promise<TaskPage> {
  const client = requireSupabase()
  return listTasksPageSupabase(client, getWorkspaceId(), pageSize, cursor)
}

export async function getTask(taskId: string): Promise<Task> {
  const client = requireSupabase()
  return getTaskSupabase(client, taskId)
}

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const client = requireSupabase()
  return getTaskCommentsSupabase(client, taskId)
}

export async function getUserProfile(): Promise<UserProfile> {
  const client = requireSupabase()
  return getUserProfileSupabase(client)
}

export async function getWorkspace(): Promise<WorkspaceSummary> {
  const client = requireSupabase()
  return getWorkspaceSupabase(client, getWorkspaceId())
}

export async function getWorkspaceStats(): Promise<WorkspaceStats> {
  const client = requireSupabase()
  return getWorkspaceStatsSupabase(client, getWorkspaceId())
}

export async function createTaskLocal(input: {
  title: string
  status: TaskStatus
  assignee: string | null
}): Promise<Task> {
  maybeThrowSimulatedWrite()
  const client = requireSupabase()
  return createTaskSupabase(client, getWorkspaceId(), input)
}

export async function patchTaskRemote(
  taskId: string,
  patch: Partial<Pick<Task, 'title' | 'status' | 'assignee'>>,
): Promise<Task> {
  maybeThrowSimulatedWrite()
  const client = requireSupabase()
  return patchTaskSupabase(client, taskId, patch)
}
