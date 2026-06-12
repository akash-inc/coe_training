import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from './tokenStorage'
import { apiUrl } from './apiBase'
import { tracingHeaders } from './requestTracing'

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  const response = await fetch(apiUrl('/token/refresh'), {
    method: 'POST',
    headers: tracingHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!response.ok) return false

  const data = await response.json()
  setAccessToken(data.access_token)
  return true
}

async function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

async function sendRequest(path, options = {}) {
  const accessToken = getAccessToken()
  const headers = tracingHeaders({
    'Content-Type': 'application/json',
    ...options.headers,
  })
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }
  return fetch(apiUrl(path), { ...options, headers })
}

async function handleResponse(response) {
  if (response.status === 204) {
    return null
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail ?? `Request failed (${response.status})`)
  }
  return response.json()
}

export async function apiFetch(path, options = {}) {
  const response = await sendRequest(path, options)

  if (response.status === 401 && !path.startsWith('/token')) {
    const refreshed = await refreshOnce()
    if (refreshed) {
      return handleResponse(await sendRequest(path, options))
    }
    clearTokens()
    throw new UnauthorizedError()
  }

  return handleResponse(response)
}
