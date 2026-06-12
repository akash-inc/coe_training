import { apiUrl } from '../lib/apiBase'
import { tracingHeaders } from '../lib/requestTracing'
import { clearTokens, getRefreshToken } from '../lib/tokenStorage'

export async function login(email, password) {
  const response = await fetch(apiUrl('/token'), {
    method: 'POST',
    headers: tracingHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail ?? 'Login failed')
  }
  return response.json()
}

export async function logout() {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    await fetch(apiUrl('/logout'), {
      method: 'POST',
      headers: tracingHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {})
  }
  clearTokens()
}
