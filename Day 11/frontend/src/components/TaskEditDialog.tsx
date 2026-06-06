import { useEffect, useRef, useState, type FormEvent } from 'react'
import { replaceTask } from '../api'
import type { Task, TaskCreatePayload, TaskStatus } from '../types'
import './TaskEditDialog.css'

interface TaskEditDialogProps {
  task: Task | null
  onClose: () => void
  onSaved: () => Promise<void>
  onError: (message: string) => void
}

interface TaskEditFormProps {
  task: Task
  onClose: () => void
  onSaved: () => Promise<void>
  onError: (message: string) => void
}

function taskToForm(task: Task) {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date ?? '',
  }
}

function TaskEditForm({ task, onClose, onSaved, onError }: TaskEditFormProps) {
  const [form, setForm] = useState(() => taskToForm(task))
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setSubmitting(true)
    const payload: TaskCreatePayload = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      due_date: form.due_date || null,
    }

    try {
      await replaceTask(task.id, payload)
      onClose()
      await onSaved()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to update task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <header className="dialog-head">
        <h3>Edit task</h3>
        <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>

      <div className="form-grid form-grid-dialog">
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
          Priority
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
            rows={3}
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
      </div>

      <footer className="dialog-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </footer>
    </form>
  )
}

export function TaskEditDialog({ task, onClose, onSaved, onError }: TaskEditDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!task) {
      dialogRef.current?.close()
      return
    }
    dialogRef.current?.showModal()
  }, [task])

  return (
    <dialog
      ref={dialogRef}
      className="edit-dialog"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {task ? (
        <TaskEditForm
          key={task.id}
          task={task}
          onClose={onClose}
          onSaved={onSaved}
          onError={onError}
        />
      ) : null}
    </dialog>
  )
}
