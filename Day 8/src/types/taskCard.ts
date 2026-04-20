export type TaskCardProps = {
  title: string
  content: string
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: boolean
}
