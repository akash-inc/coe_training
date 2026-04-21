import { type FormEvent, useId, useState } from "react"
import type { ColumnId, TaskDraft } from "../../types"
import "./AddTaskForm.css"

type AddTaskFormProps = {
  columnIds: ColumnId[]
  onAdd: (task: TaskDraft) => void
}

export default function AddTaskForm({ columnIds, onAdd }: AddTaskFormProps) {
  const titleId = useId()
  const contentId = useId()
  const columnId = useId()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [column, setColumn] = useState<ColumnId>(columnIds[0] ?? "To Do")

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      return
    }
    onAdd({
      id: crypto.randomUUID(),
      title: trimmed,
      content: content.trim(),
      column,
    })
    setTitle("")
    setContent("")
  }

  return (
    <form className="add-task-form" aria-label="Add task" onSubmit={handleSubmit}>
      <h2 className="add-task-heading">Add task</h2>
      <div className="add-task-fields">
        <div className="add-task-field">
          <label htmlFor={titleId}>Title</label>
          <input
            id={titleId}
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="add-task-field">
          <label htmlFor={contentId}>Description</label>
          <textarea
            id={contentId}
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={2}
          />
        </div>
        <div className="add-task-field">
          <label htmlFor={columnId}>Column</label>
          <select
            id={columnId}
            name="column"
            value={column}
            onChange={(event) => setColumn(event.target.value as ColumnId)}
          >
            {columnIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="add-task-submit">
        Add task
      </button>
    </form>
  )
}
