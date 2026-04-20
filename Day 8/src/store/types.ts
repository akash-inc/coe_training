import type { ColumnId } from "../types"

export type BoardSlice = {
  boardTitle: string
  columnIds: ColumnId[]
}

export type KanbanStore = BoardSlice
