import type { ReactNode } from "react"

export type ColumnProps = {
  name: string
  children: ReactNode
  isDropTarget: boolean
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
}
