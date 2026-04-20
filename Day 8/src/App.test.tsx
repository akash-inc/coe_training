import { act, fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { getInitialKanbanData, KANBAN_STORAGE_KEY, useKanbanStore } from './store'

describe('Kanban board', () => {
  beforeEach(() => {
    localStorage.clear()
    useKanbanStore.setState(getInitialKanbanData())
  })

  it('displays board title, four columns, and sample task', () => {
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

  it('moves task to In Progress on drop', () => {
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

  it('lists new task in To Do', () => {
    render(<App />)

    act(() => {
      useKanbanStore.getState().addTask({
        id: 'task-practical-add',
        title: 'Write persistence test',
        content: 'Cover localStorage and reload.',
        column: 'To Do',
      })
    })

    const toDoColumn = screen.getByRole('region', { name: /to do column/i })
    expect(within(toDoColumn).getByText(/write persistence test/i)).toBeInTheDocument()
    expect(
      within(toDoColumn).getByRole('button', { name: /drag task write persistence test/i }),
    ).toBeInTheDocument()
  })

  it('shows updated title and body after edit', () => {
    render(<App />)

    act(() => {
      useKanbanStore.getState().updateTask('task-1', {
        title: 'Fix login bug (hotfix)',
        content: 'Session cookie path corrected.',
      })
    })

    expect(screen.getByText(/fix login bug \(hotfix\)/i)).toBeInTheDocument()
    expect(screen.getByText(/session cookie path corrected/i)).toBeInTheDocument()
  })

  it('shows task in Done, not To Do, after move', () => {
    render(<App />)

    act(() => {
      useKanbanStore.getState().moveTask('task-1', 'Done')
    })

    const doneColumn = screen.getByRole('region', { name: /done column/i })
    const toDoColumn = screen.getByRole('region', { name: /to do column/i })

    expect(within(doneColumn).getByText(/fix login bug/i)).toBeInTheDocument()
    expect(within(toDoColumn).queryByText(/fix login bug/i)).not.toBeInTheDocument()
  })

  it('keeps task in In Progress after reload', async () => {
    const { unmount } = render(<App />)

    const inProgressColumn = screen.getByRole('region', { name: /in progress column/i })
    const dragTaskButton = screen.getByRole('button', { name: /drag task fix login bug/i })
    const draggableTask = dragTaskButton.closest('.task-card')

    fireEvent.dragStart(draggableTask as HTMLElement)
    fireEvent.dragOver(inProgressColumn)
    fireEvent.drop(inProgressColumn)

    expect(localStorage.getItem(KANBAN_STORAGE_KEY)).toBeTruthy()
    unmount()

    vi.resetModules()
    const { default: AppAfterReload } = await import('./App')
    const { useKanbanStore: useStoreAfterReload } = await import('./store')

    await act(async () => {
      await useStoreAfterReload.persist.rehydrate()
    })

    render(<AppAfterReload />)

    expect(
      within(screen.getByRole('region', { name: /in progress column/i })).getByText(/fix login bug/i),
    ).toBeInTheDocument()
  })
})
