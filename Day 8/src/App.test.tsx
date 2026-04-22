import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import App from './App'
import { AuthProvider } from './context/AuthProvider'
import { getInitialKanbanData, KANBAN_STORAGE_KEY, useKanbanStore } from './store'

function authWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('Kanban board', () => {
  beforeEach(() => {
    localStorage.clear()
    useKanbanStore.setState(getInitialKanbanData())
  })

  it('displays board title, four columns, and sample task', () => {
    render(<App />, { wrapper: authWrapper })

    expect(
      screen.getByRole('heading', { name: /zustand kanban board/i }),
    ).toBeInTheDocument()

    expect(screen.getByRole('form', { name: /add task/i })).toBeInTheDocument()

    expect(screen.getByRole('region', { name: /to do column/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /in progress column/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /review column/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /done column/i })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /drag task fix login bug/i })).toBeInTheDocument()
  })

  describe('dashboard', () => {
    it('shows analytics derived from task state (counts, completion %, overdue, avg time, trend)', () => {
      render(<App />, { wrapper: authWrapper })

      const dashboard = screen.getByRole('region', { name: /analytics dashboard/i })
      expect(dashboard).toBeInTheDocument()

      expect(dashboard).toHaveTextContent('25%')
      expect(dashboard).toHaveTextContent('Overdue')
      expect(dashboard).toHaveTextContent('3d 8h')
      expect(dashboard).toHaveTextContent('Stable')
    })

    it('updates completion metrics when a task moves to Done', () => {
      render(<App />, { wrapper: authWrapper })

      act(() => {
        useKanbanStore.getState().moveTask('task-2', 'Done')
      })

      const dashboard = screen.getByRole('region', { name: /analytics dashboard/i })
      expect(dashboard).toHaveTextContent('30%')
      expect(dashboard).toHaveTextContent('Completed')
    })
  })

  it('moves task to In Progress on drop', () => {
    render(<App />, { wrapper: authWrapper })

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

  describe('board UI', () => {
    it('adds a task from the form', async () => {
      const user = userEvent.setup()
      render(<App />, { wrapper: authWrapper })

      await user.type(screen.getByLabelText(/^title$/i), 'Ship dark mode')
      await user.type(screen.getByLabelText(/^description$/i), 'Toggle in settings.')
      await user.click(screen.getByRole('button', { name: /^add task$/i }))

      const toDo = screen.getByRole('region', { name: /to do column/i })
      expect(within(toDo).getByRole('heading', { name: /ship dark mode/i })).toBeInTheDocument()
      expect(within(toDo).getByText(/toggle in settings/i)).toBeInTheDocument()
    })

    it('saves edits from the card', async () => {
      const user = userEvent.setup()
      render(<App />, { wrapper: authWrapper })

      await user.click(screen.getByRole('button', { name: /edit fix login bug/i }))
      await user.clear(screen.getByLabelText(/edit task title/i))
      await user.type(screen.getByLabelText(/edit task title/i), 'Login flow stable')
      await user.clear(screen.getByLabelText(/edit task description/i))
      await user.type(screen.getByLabelText(/edit task description/i), 'Cookie path updated.')
      await user.click(screen.getByRole('button', { name: /^save$/i }))

      expect(screen.getByRole('heading', { name: /login flow stable/i })).toBeInTheDocument()
      expect(screen.getByText(/cookie path updated/i)).toBeInTheDocument()
    })

    it('removes a task from the card', async () => {
      const user = userEvent.setup()
      render(<App />, { wrapper: authWrapper })

      await user.click(
        screen.getByRole('button', { name: /delete task create project scaffold/i }),
      )

      expect(screen.queryByText(/create project scaffold/i)).not.toBeInTheDocument()
    })
  })

  it('shows task in Done, not To Do, after move', () => {
    render(<App />, { wrapper: authWrapper })

    act(() => {
      useKanbanStore.getState().moveTask('task-1', 'Done')
    })

    const doneColumn = screen.getByRole('region', { name: /done column/i })
    const toDoColumn = screen.getByRole('region', { name: /to do column/i })

    expect(within(doneColumn).getByText(/fix login bug/i)).toBeInTheDocument()
    expect(within(toDoColumn).queryByText(/fix login bug/i)).not.toBeInTheDocument()
  })

  // Keep last.
  it('keeps task in In Progress after reload', async () => {
    const { unmount } = render(<App />, { wrapper: authWrapper })

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
    const { AuthProvider: AuthProviderAfterReload } = await import('./context/AuthProvider')
    const { useKanbanStore: useStoreAfterReload } = await import('./store')

    await act(async () => {
      await useStoreAfterReload.persist.rehydrate()
    })

    render(
      <AuthProviderAfterReload>
        <AppAfterReload />
      </AuthProviderAfterReload>,
    )

    expect(
      within(screen.getByRole('region', { name: /in progress column/i })).getByText(/fix login bug/i),
    ).toBeInTheDocument()
  })
})
