import "./Column.css"

type ColumnProps = {
  name: string
  children: React.ReactNode
  isDropTarget: boolean
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
}

export default function Column({
  name,
  children,
  isDropTarget,
  onDragOver,
  onDragLeave,
  onDrop,
}: ColumnProps) {
  return (
    <section
      className={`board-column ${isDropTarget ? "board-column-drop-target" : ""}`}
      role="region"
      aria-label={`${name} column`}
      onDragOver={(event) => {
        event.preventDefault()
        onDragOver()
      }}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        event.preventDefault()
        onDrop()
      }}
    >
      <h2 className="column-title">{name}</h2>
      <div className="column-content">{children}</div>
    </section>
  )
}