import { act, fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { getInitialKanbanData, KANBAN_STORAGE_KEY, useKanbanStore } from './store'

describe('Kanban board end-state contract', () => {
  beforeEach(() => {
    localStorage.clear()
    useKanbanStore.setState(getInitialKanbanData())
  })

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

  /**
   * Simulates a full page reload: new JS bundle (vi.resetModules + dynamic import)
   * and a fresh store instance that rehydrates from localStorage.
   * Keep this test last — resetModules invalidates top-level `./App` / `./store` caches.
   */
  it('restores task column after simulated full reload', async () => {
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
