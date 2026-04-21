import { useState } from "react"
import { useShallow } from "zustand/react/shallow"
import type { ColumnId } from "../../types"
import { useKanbanStore } from "../../store"
import Dashboard from "../Dashboard/Dashboard"
import RecentActivity from "./RecentActivity"
import AddTaskForm from "./AddTaskForm"
import Column from "./Column"
import TaskCard from "./TaskCard"
import "./Board.css"

export default function Board() {
  const {
    boardTitle,
    columnIds,
    tasks,
    moveTask,
    addTask,
    updateTask,
    removeTask,
    syncError,
    clearSyncError,
  } = useKanbanStore(
    useShallow((state) => ({
      boardTitle: state.boardTitle,
      columnIds: state.columnIds,
      tasks: state.tasks,
      moveTask: state.moveTask,
      addTask: state.addTask,
      updateTask: state.updateTask,
      removeTask: state.removeTask,
      syncError: state.syncError,
      clearSyncError: state.clearSyncError,
    })),
  )

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
      {syncError ? (
        <div className="board-sync-error" role="alert">
          <span>Could not sync with the server: {syncError}</span>
          <button
            type="button"
            className="board-sync-error-dismiss"
            onClick={() => clearSyncError()}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      <Dashboard tasks={tasks} />
      <RecentActivity />
      <AddTaskForm columnIds={columnIds} onAdd={addTask} />
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
                  taskId={task.id}
                  title={task.title}
                  content={task.content}
                  onDragStart={() => handleDragStart(task.id)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedTaskId === task.id}
                  onUpdate={(updates) => updateTask(task.id, updates)}
                  onRemove={() => removeTask(task.id)}
                />
              ))}
          </Column>
        ))}
      </div>
    </main>
  )
}
