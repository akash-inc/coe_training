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

export function updateComment(taskId, commentId, body) {
  return apiFetch(`/tasks/${taskId}/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ body }),
  })
}

export function deleteComment(taskId, commentId) {
  return apiFetch(`/tasks/${taskId}/comments/${commentId}`, { method: 'DELETE' })
}
