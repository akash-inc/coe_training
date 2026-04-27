import type { SupabaseClient } from '@supabase/supabase-js'
import { taskCommentSchema, taskPageSchema, taskSchema, userProfileSchema, workspaceStatsSchema, workspaceSummarySchema } from '../schemas'
import type { Task, TaskComment, TaskPage, TaskStatus, UserProfile, WorkspaceStats, WorkspaceSummary } from '../schemas'
import type { Database } from '../../lib/supabase/database.types'
import { ApiError } from '../errors'

function mapTaskRow(r: Database['public']['Tables']['rq10_tasks']['Row']): Task {
  return taskSchema.parse({
    id: r.id,
    title: r.title,
    status: r.status,
    assignee: r.assignee,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  })
}

function mapCommentRow(
  r: Database['public']['Tables']['rq10_task_comments']['Row'],
): TaskComment {
  return taskCommentSchema.parse({
    id: r.id,
    taskId: r.task_id,
    body: r.body,
    createdAt: r.created_at,
  })
}

export async function listTasksPageSupabase(
  client: SupabaseClient<Database>,
  workspaceId: string,
  pageSize: number,
  cursor: number | null,
): Promise<TaskPage> {
  const offset = cursor ?? 0
  const { data, error } = await client
    .from('rq10_tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    throw new ApiError(error.message, 500)
  }
  const rows = data ?? []
  const items = rows.map((row) => mapTaskRow(row))
  const nextCursor = rows.length < pageSize ? null : offset + pageSize
  return taskPageSchema.parse({ items, nextCursor })
}

export async function getTaskSupabase(
  client: SupabaseClient<Database>,
  taskId: string,
): Promise<Task> {
  const { data, error } = await client.from('rq10_tasks').select('*').eq('id', taskId).maybeSingle()
  if (error) {
    throw new ApiError(error.message, 500)
  }
  if (!data) {
    throw new ApiError('Task not found', 404)
  }
  return mapTaskRow(data)
}

export async function getTaskCommentsSupabase(
  client: SupabaseClient<Database>,
  taskId: string,
): Promise<TaskComment[]> {
  const { data, error } = await client
    .from('rq10_task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new ApiError(error.message, 500)
  }
  return (data ?? []).map((row) => mapCommentRow(row))
}

export async function getUserProfileSupabase(
  client: SupabaseClient<Database>,
): Promise<UserProfile> {
  const { data, error } = await client.from('rq10_user_stub').select('*').limit(1).maybeSingle()
  if (error) {
    throw new ApiError(error.message, 500)
  }
  if (!data) {
    throw new ApiError('Profile not found', 404)
  }
  return userProfileSchema.parse({
    id: data.id,
    displayName: data.display_name,
    email: data.email,
  })
}

export async function getWorkspaceSupabase(
  client: SupabaseClient<Database>,
  workspaceId: string,
): Promise<WorkspaceSummary> {
  const { data, error } = await client
    .from('rq10_workspaces')
    .select('*')
    .eq('id', workspaceId)
    .maybeSingle()
  if (error) {
    throw new ApiError(error.message, 500)
  }
  if (!data) {
    throw new ApiError('Workspace not found', 404)
  }
  return workspaceSummarySchema.parse({ id: data.id, name: data.name })
}

async function countByStatus(
  client: SupabaseClient<Database>,
  workspaceId: string,
  status: TaskStatus,
): Promise<number> {
  const { count, error } = await client
    .from('rq10_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', status)
  if (error) {
    throw new ApiError(error.message, 500)
  }
  return count ?? 0
}

export async function getWorkspaceStatsSupabase(
  client: SupabaseClient<Database>,
  workspaceId: string,
): Promise<WorkspaceStats> {
  const [open, inProgress, done] = await Promise.all([
    countByStatus(client, workspaceId, 'open'),
    countByStatus(client, workspaceId, 'in_progress'),
    countByStatus(client, workspaceId, 'done'),
  ])
  return workspaceStatsSchema.parse({ open, inProgress, done })
}

export async function createTaskSupabase(
  client: SupabaseClient<Database>,
  workspaceId: string,
  input: { title: string; status: TaskStatus; assignee: string | null },
): Promise<Task> {
  const { data, error } = await client
    .from('rq10_tasks')
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      status: input.status,
      assignee: input.assignee,
    })
    .select('*')
    .single()
  if (error) {
    throw new ApiError(error.message, 500)
  }
  return mapTaskRow(data)
}

export async function patchTaskSupabase(
  client: SupabaseClient<Database>,
  taskId: string,
  patch: Partial<Pick<Task, 'title' | 'status' | 'assignee'>>,
): Promise<Task> {
  const row: Database['public']['Tables']['rq10_tasks']['Update'] = {}
  if (patch.title != null) {
    row.title = patch.title
  }
  if (patch.status != null) {
    row.status = patch.status
  }
  if (patch.assignee !== undefined) {
    row.assignee = patch.assignee
  }
  const { data, error } = await client.from('rq10_tasks').update(row).eq('id', taskId).select('*').single()
  if (error) {
    throw new ApiError(error.message, 500)
  }
  if (!data) {
    throw new ApiError('Task not found', 404)
  }
  return mapTaskRow(data)
}
