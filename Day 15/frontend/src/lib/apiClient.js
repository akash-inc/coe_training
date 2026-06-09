import { getAccessToken } from "./tokenStorage"

export function apiFetch(url, options = {}) {
  const accessToken = getAccessToken()
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }
  return fetch(url, { ...options, headers })
}