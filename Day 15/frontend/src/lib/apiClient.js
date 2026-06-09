import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from './tokenStorage'

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

  const response = await fetch('/token/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

async function sendRequest(url, options = {}) {
  const accessToken = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }
  return fetch(url, { ...options, headers })
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

export async function apiFetch(url, options = {}) {
  const response = await sendRequest(url, options)

  if (response.status === 401 && !url.startsWith('/token')) {
    const refreshed = await refreshOnce()
    if (refreshed) {
      return handleResponse(await sendRequest(url, options))
    }
    clearTokens()
    throw new UnauthorizedError()
  }

  return handleResponse(response)
}
