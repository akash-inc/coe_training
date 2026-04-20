import { useId, useState } from "react"
import type { TaskCardProps } from "../../types"
import "./TaskCard.css"

export default function TaskCard({
  taskId,
  title,
  content,
  onDragStart,
  onDragEnd,
  isDragging,
  onUpdate,
  onRemove,
}: TaskCardProps) {
  const editTitleId = useId()
  const editContentId = useId()
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)
  const [draftContent, setDraftContent] = useState(content)

  const startEdit = () => {
    setDraftTitle(title)
    setDraftContent(content)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraftTitle(title)
    setDraftContent(content)
  }

  const saveEdit = () => {
    const nextTitle = draftTitle.trim()
    if (!nextTitle) {
      return
    }
    onUpdate({ title: nextTitle, content: draftContent.trim() })
    setEditing(false)
  }

  return (
    <article
      className={`task-card ${isDragging ? "task-card-dragging" : ""}`}
      draggable={!editing}
      onDragStart={editing ? undefined : onDragStart}
      onDragEnd={onDragEnd}
      aria-grabbed={isDragging}
      data-task-id={taskId}
    >
      <div className="task-card-toolbar">
        <button type="button" className="task-drag-handle" aria-label={`Drag task ${title}`}>
          Drag
        </button>
        <div className="task-card-actions">
          {editing ? (
            <>
              <button type="button" className="task-action" onClick={saveEdit}>
                Save
              </button>
              <button type="button" className="task-action" onClick={cancelEdit}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" className="task-action" onClick={startEdit} aria-label={`Edit ${title}`}>
                Edit
              </button>
              <button
                type="button"
                className="task-action task-action-danger"
                onClick={onRemove}
                aria-label={`Delete task ${title}`}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <div className="task-edit-fields">
          <label htmlFor={editTitleId}>Title</label>
          <input
            id={editTitleId}
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            aria-label="Edit task title"
          />
          <label htmlFor={editContentId}>Description</label>
          <textarea
            id={editContentId}
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
            rows={2}
            aria-label="Edit task description"
          />
        </div>
      ) : (
        <>
          <h3 className="task-title">{title}</h3>
          <p className="task-content">{content}</p>
        </>
      )}
    </article>
  )
}
