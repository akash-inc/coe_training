import { useState } from "react"
import Column from "./Column"
import TaskCard from "./TaskCard"
import "./Board.css"

type ColumnId = "To Do" | "In Progress" | "Review" | "Done"

type Task = {
  id: string
  title: string
  content: string
  column: ColumnId
}

const COLUMNS: ColumnId[] = ["To Do", "In Progress", "Review", "Done"]

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Fix login bug",
    content: "Users get signed out after refresh.",
    column: "To Do",
  },
  {
    id: "task-2",
    title: "Implement Zustand slices",
    content: "Split board, tasks, users, filters.",
    column: "In Progress",
  },
  {
    id: "task-3",
    title: "Add optimistic updates",
    content: "Rollback state when API call fails.",
    column: "Review",
  },
  {
    id: "task-4",
    title: "Create project scaffold",
    content: "Base app and test setup completed.",
    column: "Done",
  },
]

export default function Board() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
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

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === draggedTaskId ? { ...task, column: targetColumn } : task,
      ),
    )
    setDraggedTaskId(null)
    setDropColumn(null)
  }

  return (
    <main className="board">
      <h1 className="board-title">zustand kanban board</h1>
      <div className="board-columns">
        {COLUMNS.map((column) => (
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