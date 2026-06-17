import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTask, deleteTask, getTasks, updateTask } from '../api/task'
import { queryKeys } from '../api/queryKeys'
import { UnauthorizedError } from '../lib/apiClient'
import { useOnSessionExpired } from '../contexts/SessionContext'
import TaskComments from './TaskComments'
import './TaskList.css'

const EMPTY_FORM = { title: '', description: '' }

export default function TaskList({ accessToken, userEmail }) {
  const onSessionExpired = useOnSessionExpired()
  const queryClient = useQueryClient()
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [createForm, setCreateForm] = useState(EMPTY_FORM)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: getTasks,
    retry: (_, err) => !(err instanceof UnauthorizedError),
  })

  const { mutate: addTask, isPending: isCreating } = useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      queryClient.setQueryData(queryKeys.tasks, (existing = []) => [...existing, task])
      setCreateForm(EMPTY_FORM)
      setSelectedTaskId(task.id)
    },
  })

  const { mutate: patchTask, isPending: isUpdating, variables: patchVariables } = useMutation({
    mutationFn: ({ taskId, payload }) => updateTask(taskId, payload),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(queryKeys.tasks, (existing = []) =>
        existing.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      )
      setEditingTaskId(null)
      setEditForm(EMPTY_FORM)
    },
  })

  const { mutate: removeTask, isPending: isDeleting } = useMutation({
    mutationFn: deleteTask,
    onSuccess: (_result, taskId) => {
      queryClient.setQueryData(queryKeys.tasks, (existing = []) =>
        existing.filter((task) => task.id !== taskId),
      )
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null)
      }
      if (editingTaskId === taskId) {
        setEditingTaskId(null)
        setEditForm(EMPTY_FORM)
      }
    },
  })

  useEffect(() => {
    if (error instanceof UnauthorizedError) {
      onSessionExpired()
    }
  }, [error, onSessionExpired])

  function handleCreateSubmit(event) {
    event.preventDefault()
    const title = createForm.title.trim()
    if (!title || isCreating) return

    addTask({
      title,
      description: createForm.description.trim(),
    })
  }

  function toggleTaskComments(taskId) {
    setSelectedTaskId((current) => (current === taskId ? null : taskId))
  }

  function startEditing(task) {
    setEditingTaskId(task.id)
    setEditForm({ title: task.title, description: task.description })
    setSelectedTaskId(null)
  }

  function cancelEditing() {
    setEditingTaskId(null)
    setEditForm(EMPTY_FORM)
  }

  function handleEditSubmit(event) {
    event.preventDefault()
    const title = editForm.title.trim()
    if (!title || !editingTaskId || isUpdating) return

    patchTask({
      taskId: editingTaskId,
      payload: {
        title,
        description: editForm.description.trim(),
      },
    })
  }

  function handleToggleComplete(task, event) {
    event.stopPropagation()
    patchTask({
      taskId: task.id,
      payload: { completed: !task.completed },
    })
  }

  function handleDelete(task, event) {
    event.stopPropagation()
    if (isDeleting) return
    removeTask(task.id)
  }

  if (isLoading) {
    return (
      <section className="task-section">
        <h2 className="task-heading">Your tasks</h2>
        <div className="task-skeleton" />
        <div className="task-skeleton" />
      </section>
    )
  }

  if (isError && !(error instanceof UnauthorizedError)) {
    return <p className="task-error">{error.message}</p>
  }

  return (
    <section className="task-section">
      <div className="task-section-header">
        <h2 className="task-heading">Your tasks</h2>
        <span className="task-count">{data?.length ?? 0}</span>
      </div>

      <form className="task-create-form" onSubmit={handleCreateSubmit}>
        <h3 className="task-form-title">New task</h3>
        <input
          type="text"
          className="task-form-input"
          value={createForm.title}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="Title"
          maxLength={255}
          disabled={isCreating}
        />
        <textarea
          className="task-form-textarea"
          value={createForm.description}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="Description (optional)"
          rows={2}
          disabled={isCreating}
        />
        <button type="submit" className="task-form-submit" disabled={!createForm.title.trim() || isCreating}>
          {isCreating ? 'Creating…' : 'Add task'}
        </button>
      </form>

      {data?.length === 0 ? (
        <p className="task-empty">No tasks yet.</p>
      ) : (
        <ul className="task-list">
          {data?.map((task) => (
            <li key={task.id}>
              {editingTaskId === task.id ? (
                <form className="task-edit-form" onSubmit={handleEditSubmit}>
                  <input
                    type="text"
                    className="task-form-input"
                    value={editForm.title}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    maxLength={255}
                    disabled={isUpdating}
                  />
                  <textarea
                    className="task-form-textarea"
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={2}
                    disabled={isUpdating}
                  />
                  <div className="task-card-actions">
                    <button type="submit" className="task-action-btn" disabled={!editForm.title.trim() || isUpdating}>
                      Save
                    </button>
                    <button type="button" className="task-action-btn task-action-btn--muted" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div
                    className={`task-card ${selectedTaskId === task.id ? 'task-card--selected' : ''}`}
                  >
                    <button
                      type="button"
                      className="task-card-select"
                      onClick={() => toggleTaskComments(task.id)}
                      aria-expanded={selectedTaskId === task.id}
                    >
                      <div className="task-card-body">
                        <h3 className="task-title">{task.title}</h3>
                        <p className="task-description">{task.description || 'No description'}</p>
                      </div>
                      <span
                        className={`task-badge ${task.completed ? 'task-badge--done' : 'task-badge--open'}`}
                      >
                        {task.completed ? 'Done' : 'Open'}
                      </span>
                    </button>
                    <div className="task-card-actions">
                      <button
                        type="button"
                        className={`task-action-btn ${selectedTaskId === task.id ? 'task-action-btn--active' : ''}`}
                        onClick={() => toggleTaskComments(task.id)}
                      >
                        {selectedTaskId === task.id ? 'Hide comments' : 'Comments'}
                      </button>
                      <button
                        type="button"
                        className="task-action-btn"
                        onClick={(event) => handleToggleComplete(task, event)}
                        disabled={isUpdating && patchVariables?.taskId === task.id}
                      >
                        {task.completed ? 'Reopen' : 'Complete'}
                      </button>
                      <button
                        type="button"
                        className="task-action-btn task-action-btn--muted"
                        onClick={() => startEditing(task)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="task-action-btn task-action-btn--danger"
                        onClick={(event) => handleDelete(task, event)}
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {selectedTaskId === task.id && accessToken && (
                    <TaskComments
                      key={task.id}
                      taskId={task.id}
                      token={accessToken}
                      userEmail={userEmail}
                      onClose={() => setSelectedTaskId(null)}
                    />
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
