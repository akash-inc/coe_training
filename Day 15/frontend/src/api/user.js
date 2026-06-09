import { apiFetch } from "../lib/apiClient"

export async function fetchMe() {
  const response = await apiFetch("/me", { method: "GET" })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail ?? "Failed to fetch user")
  }
  return response.json()
}
