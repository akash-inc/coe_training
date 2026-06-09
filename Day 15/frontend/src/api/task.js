import { apiFetch } from "../lib/apiClient"

export function getTasks() {
  return apiFetch("/tasks", { method: "GET" })
}
