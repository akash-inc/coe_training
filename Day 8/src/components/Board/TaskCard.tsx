import "./TaskCard.css"

type TaskCardProps = {
  title: string
  content: string
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: boolean
}

export default function TaskCard({
  title,
  content,
  onDragStart,
  onDragEnd,
  isDragging,
}: TaskCardProps) {
  return (
    <article
      className={`task-card ${isDragging ? "task-card-dragging" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-grabbed={isDragging}
    >
      <button type="button" className="task-drag-handle" aria-label={`Drag task ${title}`}>
        Drag
      </button>
      <h3 className="task-title">{title}</h3>
      <p className="task-content">{content}</p>
    </article>
  )
}