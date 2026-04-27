import { z } from 'zod'

export const taskStatusSchema = z.enum(['open', 'in_progress', 'done'])
export type TaskStatus = z.infer<typeof taskStatusSchema>

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: taskStatusSchema,
  assignee: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Task = z.infer<typeof taskSchema>

export const taskCommentSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  body: z.string(),
  createdAt: z.string(),
})
export type TaskComment = z.infer<typeof taskCommentSchema>

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  email: z.string().email(),
})
export type UserProfile = z.infer<typeof userProfileSchema>

export const workspaceSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
})
export type WorkspaceSummary = z.infer<typeof workspaceSummarySchema>

export const workspaceStatsSchema = z.object({
  open: z.number().int().nonnegative(),
  inProgress: z.number().int().nonnegative(),
  done: z.number().int().nonnegative(),
})
export type WorkspaceStats = z.infer<typeof workspaceStatsSchema>

export const taskPageSchema = z.object({
  items: z.array(taskSchema),
  nextCursor: z.number().nullable(),
})
export type TaskPage = z.infer<typeof taskPageSchema>
