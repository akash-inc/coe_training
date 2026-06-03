import { useMemo, useState, type FormEvent } from 'react'
import { createTask, deleteTask, patchTask } from '../api'
import type { Task, TaskCreatePayload, TaskStatus, User } from '../types'
import { TaskEditDialog } from './TaskEditDialog'
import './TaskPanel.css'

interface TaskPanelProps {
  users: User[]
  tasks: Task[]
  onChanged: () => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

function formatStatus(status: TaskStatus): string {
  return status.replace(/_/g, ' ')
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

export function TaskPanel({ users, tasks, onChanged, onError, onSuccess }: TaskPanelProps) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form, setForm] = useState({
    title: 'Untitled',
    description: '',
    status: 'open' as TaskStatus,
    priority: 3,
    user_id: '',
    due_date: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const userById = useMemo(
    () => new Map(users.map((user) => [user.id, user.name])),
    [users],
  )

  const visibleTasks = useMemo(() => {
    if (!statusFilter) return tasks
    return tasks.filter((task) => task.status === statusFilter)
  }, [tasks, statusFilter])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!form.user_id) {
      onError('Select a user for the task')
      return
    }

    setSubmitting(true)
    const payload: TaskCreatePayload = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      user_id: Number(form.user_id),
      due_date: form.due_date || null,
    }

    try {
      await createTask(payload)
      setForm({
        title: 'Untitled',
        description: '',
        status: 'open',
        priority: 3,
        user_id: '',
        due_date: '',
      })
      onSuccess('Task created')
      await onChanged()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(taskId: number) {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      onSuccess('Task deleted')
      await onChanged()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to delete task')
    }
  }

  async function handleQuickStatus(task: Task, status: TaskStatus) {
    try {
      await patchTask(task.id, { status })
      onSuccess('Status updated')
      await onChanged()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  return (
    <section className="panel panel-wide" aria-labelledby="tasks-heading">
      <div className="panel-head">
        <h2 id="tasks-heading">Tasks</h2>
        <span className="badge">{visibleTasks.length}</span>
      </div>

      <div className="toolbar">
        <label className="filter-label">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <button type="button" className="btn btn-ghost" onClick={() => onChanged()}>
          Refresh
        </button>
      </div>

      <form className="form-grid form-grid-task" onSubmit={handleCreate}>
        <label>
          Title
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
            minLength={1}
            maxLength={255}
          />
        </label>
        <label>
          Owner
          <select
            value={form.user_id}
            onChange={(e) => setForm((prev) => ({ ...prev, user_id: e.target.value }))}
            required
          >
            <option value="">Select user…</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, status: e.target.value as TaskStatus }))
            }
          >
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label>
          Priority (1–5)
          <input
            type="number"
            min={1}
            max={5}
            value={form.priority}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, priority: Number(e.target.value) }))
            }
          />
        </label>
        <label className="span-2">
          Description
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </label>
        <label>
          Due date
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting || users.length === 0}>
          {submitting ? 'Adding…' : 'Add task'}
        </button>
      </form>

      <div className="task-cards">
        {visibleTasks.length === 0 ? (
          <p className="empty-state">No tasks match this filter.</p>
        ) : (
          visibleTasks.map((task) => (
            <article key={task.id} className="task-card">
              <div className="task-card-head">
                <h3>{task.title}</h3>
                <div className="task-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setEditingTask(task)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="task-desc">{task.description || 'No description'}</p>
              <div className="task-meta">
                <span className={`chip status-${task.status}`}>{formatStatus(task.status)}</span>
                <span className="chip">Priority {task.priority}</span>
                <span className="chip">{userById.get(task.user_id) ?? `User #${task.user_id}`}</span>
                <span className="chip">Due {formatDate(task.due_date)}</span>
              </div>
              <div className="quick-status">
                {(['open', 'in_progress', 'done'] as TaskStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`btn btn-ghost btn-sm ${task.status === status ? 'active' : ''}`}
                    onClick={() => handleQuickStatus(task, status)}
                    disabled={task.status === status}
                  >
                    {formatStatus(status)}
                  </button>
                ))}
              </div>
            </article>
          ))
        )}
      </div>

      <TaskEditDialog
        task={editingTask}
        users={users}
        onClose={() => setEditingTask(null)}
        onSaved={async () => {
          onSuccess('Task updated')
          await onChanged()
        }}
        onError={onError}
      />
    </section>
  )
}
