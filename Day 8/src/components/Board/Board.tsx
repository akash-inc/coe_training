import Column from "./Column"
import TaskCard from "./TaskCard"
import "./Board.css"

export default function Board() {
  return (
    <main className="board">
      <h1 className="board-title">zustand kanban board</h1>
      <div className="board-columns">
        <Column name="To Do">
          <TaskCard title="Fix login bug" content="Users get signed out after refresh." />
        </Column>
        <Column name="In Progress">
          <TaskCard title="Implement Zustand slices" content="Split board, tasks, users, filters." />
        </Column>
        <Column name="Review">
          <TaskCard title="Add optimistic updates" content="Rollback state when API call fails." />
        </Column>
        <Column name="Done">
          <TaskCard title="Create project scaffold" content="Base app and test setup completed." />
        </Column>
      </div>
    </main>
  )
}