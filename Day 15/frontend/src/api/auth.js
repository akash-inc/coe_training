import { apiFetch } from "../lib/apiClient"

async function login(email, password) {
  const response = await apiFetch("/token", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail ?? "Login failed")
  }
  return response.json()
}

export { login }