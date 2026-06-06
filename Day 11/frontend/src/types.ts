export type TaskStatus = 'open' | 'in_progress' | 'done'

export interface User {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: number
  due_date: string | null
  created_at: string
  updated_at: string
  user_id: number
}

export interface TaskCreatePayload {
  title: string
  description: string
  status: TaskStatus
  priority: number
  due_date: string | null
  user_id?: number
}

export interface UserCreatePayload {
  name: string
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface TaskCounts {
  total: number
  open: number
  in_progress: number
  done: number
}

export interface Dashboard {
  user: User
  task_counts: TaskCounts
}

export interface RefreshTokenResponse {
  access_token: string
  token_type: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}