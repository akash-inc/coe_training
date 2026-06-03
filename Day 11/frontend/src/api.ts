import type { Task, TaskCreatePayload, User, UserCreatePayload } from './types'

async function parseError(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}))
  const detail = (body as { detail?: unknown }).detail
  if (typeof detail === 'string') return detail
  if (detail !== undefined) return JSON.stringify(detail)
  return `Request failed (${response.status})`
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<T>
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
