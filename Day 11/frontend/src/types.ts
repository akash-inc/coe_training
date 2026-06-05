export type TaskStatus = 'open' | 'in_progress' | 'done'

export interface User {
  id: number
  name: string
  email: string
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
}

export interface UserCreatePayload {
  name: string
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
