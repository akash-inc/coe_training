import { apiFetch } from '../lib/apiClient'

export function getComments(taskId) {
  return apiFetch(`/tasks/${taskId}/comments`, { method: 'GET' })
}
