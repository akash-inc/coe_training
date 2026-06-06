import {
  apiRequest,
  apiRequestPublic,
  clearStoredTokens,
  getStoredRefreshToken,
  parseError,
} from './lib/httpClient'
import type {
  Dashboard,
  RefreshTokenResponse,
  Task,
  TaskCreatePayload,
  TokenResponse,
  User,
  UserCreatePayload,
} from './types'

export {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
} from './lib/httpClient'

export async function login(email: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams({ username: email, password })
  const response = await fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  return response.json() as Promise<TokenResponse>
}

export async function logout(): Promise<void> {
  const refresh = getStoredRefreshToken()
  if (refresh) {
    await fetch('/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => {})
  }
  clearStoredTokens()
}

export function fetchDashboard(): Promise<Dashboard> {
  return apiRequest<Dashboard>('/dashboard')
}

export function fetchUsers(): Promise<User[]> {
  return apiRequest<User[]>('/users')
}

export function createUser(payload: UserCreatePayload): Promise<User> {
  return apiRequest<User>('/users', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchTasks(userId?: number): Promise<Task[]> {
  const query = userId !== undefined ? `?user_id=${userId}` : ''
  return apiRequest<Task[]>(`/tasks${query}`)
}

export function createTask(payload: TaskCreatePayload): Promise<Task> {
  return apiRequest<Task>('/tasks', { method: 'POST', body: JSON.stringify(payload) })
}

export function replaceTask(taskId: number, payload: TaskCreatePayload): Promise<Task> {
  return apiRequest<Task>(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function patchTask(
  taskId: number,
  payload: Partial<TaskCreatePayload>,
): Promise<Task> {
  return apiRequest<Task>(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function deleteTask(taskId: number): Promise<void> {
  return apiRequest<void>(`/tasks/${taskId}`, { method: 'DELETE' })
}

export function deleteUser(userId: number): Promise<void> {
  return apiRequest<void>(`/users/${userId}`, { method: 'DELETE' })
}

export function fetchGithubAuthEnabled(): Promise<{ enabled: boolean }> {
  return apiRequestPublic<{ enabled: boolean }>('/auth/github/enabled').catch(() => ({
    enabled: false,
  }))
}

export type { RefreshTokenResponse }
