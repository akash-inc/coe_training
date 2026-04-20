import type { Task } from "./board"

export type TaskCardProps = {
  taskId: string
  title: string
  content: string
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: boolean
  onUpdate: (updates: Partial<Omit<Task, "id">>) => void
  onRemove: () => void
}
