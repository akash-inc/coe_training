import { apiFetch } from '../lib/apiClient'

export function getTasks() {
  return apiFetch('/tasks', { method: 'GET' })
}

export function createTask(payload) {
  return apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTask(taskId, payload) {
  return apiFetch(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteTask(taskId) {
  return apiFetch(`/tasks/${taskId}`, { method: 'DELETE' })
}
