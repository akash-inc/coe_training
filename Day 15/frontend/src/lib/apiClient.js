import { clearAccessToken, getAccessToken } from "./tokenStorage"

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export async function apiFetch(url, options = {}) {
  const accessToken = getAccessToken()
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    clearAccessToken()
    throw new UnauthorizedError()
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail ?? `Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
