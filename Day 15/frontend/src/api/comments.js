import { apiFetch } from '../lib/apiClient'

export function getComments(taskId) {
  return apiFetch(`/tasks/${taskId}/comments`, { method: 'GET' })
}

export function createComment(taskId, body) {
  return apiFetch(`/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}
