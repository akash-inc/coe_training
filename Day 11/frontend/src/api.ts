import type {
  Dashboard,
  RefreshTokenResponse,
  Task,
  TaskCreatePayload,
  TokenResponse,
  User,
  UserCreatePayload,
} from './types'

const ACCESS_TOKEN_KEY = 'task_manager_access_token'
const REFRESH_TOKEN_KEY = 'task_manager_refresh_token'

let refreshPromise: Promise<boolean> | null = null;

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setStoredAccessToken(access: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
}

export function setStoredTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

export function clearStoredTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

async function parseError(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}))
  const detail = (body as { detail?: unknown }).detail
  if (typeof detail === 'string') return detail
  if (detail !== undefined) return JSON.stringify(detail)
  return `Request failed (${response.status})`
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) return false;
  const response = await fetch('/token/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!response.ok) return false;
  const data = (await response.json()) as RefreshTokenResponse
  setStoredAccessToken(data.access_token)
  return true
}

async function refreshOnce(): Promise<boolean> {
  if(!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await sendRequest(path, options);

  if (response.status === 401 && !path.startsWith('/token')) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      const retry = await sendRequest(path, options);
      return handleResponse<T>(retry);
    }
    clearStoredTokens();
    throw new Error('Session expired');
  }
  return handleResponse<T>(response);
}

async function sendRequest(path: string, options: RequestInit): Promise<Response> {
  const token = getStoredAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return fetch(path, { ...options, headers })
}
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  if (!response.ok) throw new Error(await parseError(response))
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

export async function logout(): Promise<void> {
  const refresh = getStoredRefreshToken();
  if (refresh) {
    await fetch('/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => {});
  }
  clearStoredTokens();
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

export function fetchTasks(userId?: number): Promise<Task[]> {
  const query = userId !== undefined ? `?user_id=${userId}` : ''
  return request<Task[]>(`/tasks${query}`)
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

export function deleteUser(userId: number): Promise<void> {
  return request<void>(`/users/${userId}`, { method: 'DELETE' })
}
