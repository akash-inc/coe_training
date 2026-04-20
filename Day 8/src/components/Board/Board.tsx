import { useState } from "react"
import type { ColumnId } from "../../types"
import { useKanbanStore } from "../../store"
import Column from "./Column"
import TaskCard from "./TaskCard"
import "./Board.css"

export default function Board() {
  const boardTitle = useKanbanStore((state) => state.boardTitle)
  const columnIds = useKanbanStore((state) => state.columnIds)
  const tasks = useKanbanStore((state) => state.tasks)
  const moveTask = useKanbanStore((state) => state.moveTask)

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dropColumn, setDropColumn] = useState<ColumnId | null>(null)

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDropColumn(null)
  }

  const handleDrop = (targetColumn: ColumnId) => {
    if (!draggedTaskId) {
      return
    }

    moveTask(draggedTaskId, targetColumn)
    setDraggedTaskId(null)
    setDropColumn(null)
  }

  return (
    <main className="board">
      <h1 className="board-title">{boardTitle}</h1>
      <div className="board-columns">
        {columnIds.map((column) => (
          <Column
            key={column}
            name={column}
            isDropTarget={dropColumn === column}
            onDragOver={() => setDropColumn(column)}
            onDragLeave={() => setDropColumn((prevColumn) => (prevColumn === column ? null : prevColumn))}
            onDrop={() => handleDrop(column)}
          >
            {tasks
              .filter((task) => task.column === column)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  content={task.content}
                  onDragStart={() => handleDragStart(task.id)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedTaskId === task.id}
                />
              ))}
          </Column>
        ))}
      </div>
    </main>
  )
}