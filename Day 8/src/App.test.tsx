import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'

describe('Kanban board end-state contract', () => {
  it('renders a drag-and-drop board with four workflow columns', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /zustand kanban board/i }),
    ).toBeInTheDocument()

    expect(screen.getByRole('region', { name: /to do column/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /in progress column/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /review column/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /done column/i })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /drag task fix login bug/i })).toBeInTheDocument()
  })

  it('moves a task from To Do to In Progress when dropped', () => {
    render(<App />)

    const toDoColumn = screen.getByRole('region', { name: /to do column/i })
    const inProgressColumn = screen.getByRole('region', { name: /in progress column/i })
    const dragTaskButton = screen.getByRole('button', { name: /drag task fix login bug/i })
    const draggableTask = dragTaskButton.closest('.task-card')

    expect(draggableTask).not.toBeNull()
    expect(within(toDoColumn).getByText(/fix login bug/i)).toBeInTheDocument()

    fireEvent.dragStart(draggableTask as HTMLElement)
    fireEvent.dragOver(inProgressColumn)
    fireEvent.drop(inProgressColumn)

    expect(within(inProgressColumn).getByText(/fix login bug/i)).toBeInTheDocument()
  })
})
