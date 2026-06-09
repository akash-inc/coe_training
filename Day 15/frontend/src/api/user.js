import { apiFetch } from "../lib/apiClient"

export function fetchMe() {
  return apiFetch("/me", { method: "GET" })
}
