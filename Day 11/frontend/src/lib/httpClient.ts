const ACCESS_TOKEN_KEY = 'task_manager_access_token'
const REFRESH_TOKEN_KEY = 'task_manager_refresh_token'

let refreshPromise: Promise<boolean> | null = null

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
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

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) return false

  const response = await fetch('/token/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!response.ok) return false

  const data = (await response.json()) as { access_token: string }
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token)
  return true
}

async function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
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

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await sendRequest(path, options)

  if (response.status === 401 && !path.startsWith('/token')) {
    const refreshed = await refreshOnce()
    if (refreshed) {
      return handleResponse<T>(await sendRequest(path, options))
    }
    clearStoredTokens()
    throw new Error('Session expired')
  }

  return handleResponse<T>(response)
}

export async function apiRequestPublic<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, options)
  return handleResponse<T>(response)
}

export { parseError }
