import type {
  Dashboard,
  Task,
  TaskCreatePayload,
  TokenResponse,
  User,
  UserCreatePayload,
} from './types'

const TOKEN_KEY = 'task_manager_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function parseError(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}))
  const detail = (body as { detail?: unknown }).detail
  if (typeof detail === 'string') return detail
  if (detail !== undefined) return JSON.stringify(detail)
  return `Request failed (${response.status})`
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(path, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<T>
}

export function login(email: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams({ username: email, password })
  return fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(await parseError(response))
    }
    return response.json() as Promise<TokenResponse>
  })
}

export function fetchCurrentUser(): Promise<User> {
  return request<User>('/me')
}

export function fetchDashboard(): Promise<Dashboard> {
  return request<Dashboard>('/dashboard')
}

export function fetchUsers(): Promise<User[]> {
  return request<User[]>('/users')
}

export function createUser(payload: UserCreatePayload): Promise<User> {
  return request<User>('/users', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks')
}

export function createTask(payload: TaskCreatePayload): Promise<Task> {
  return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(payload) })
}

export function replaceTask(taskId: number, payload: TaskCreatePayload): Promise<Task> {
  return request<Task>(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function patchTask(
  taskId: number,
  payload: Partial<TaskCreatePayload>,
): Promise<Task> {
  return request<Task>(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function deleteTask(taskId: number): Promise<void> {
  return request<void>(`/tasks/${taskId}`, { method: 'DELETE' })
}
