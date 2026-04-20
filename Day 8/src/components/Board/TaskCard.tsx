import "./TaskCard.css"

export default function TaskCard({ title, content }: { title: string; content: string }) {
  return (
    <article className="task-card">
      <h3 className="task-title">{title}</h3>
      <p className="task-content">{content}</p>
    </article>
  )
}