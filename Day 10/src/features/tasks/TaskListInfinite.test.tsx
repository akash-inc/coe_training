import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskListInfinite } from './TaskListInfinite'
import { renderWithProviders } from '../../test/renderWithProviders'
import {
  makeTask,
  makeTaskPage,
  TEST_TASK_ID_1,
  TEST_TASK_ID_2,
} from '../../test/fixtures'
import { listTasksPage } from '../../api/unified'

vi.mock('../../api/unified', () => ({
  getWorkspaceId: () => '20000000-0000-4000-8000-000000000001',
  listTasksPage: vi.fn(),
  getTask: vi.fn(),
}))

describe('TaskListInfinite', () => {
  beforeEach(() => {
    vi.mocked(listTasksPage).mockResolvedValue(
      makeTaskPage({
        items: [makeTask({ id: TEST_TASK_ID_1, title: 'Task Alpha', status: 'open' })],
        nextCursor: null,
      }),
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    renderWithProviders(<TaskListInfinite />)
    expect(screen.getByText('Loading tasks…')).toBeInTheDocument()
  })

  it('renders task titles after data loads', async () => {
    renderWithProviders(<TaskListInfinite />)
    await waitFor(() => {
      expect(screen.getByText('Task Alpha')).toBeInTheDocument()
    })
  })

  it('shows end-of-list message when no next page', async () => {
    renderWithProviders(<TaskListInfinite />)
    await waitFor(() => {
      expect(screen.getByText("You're at the end of the list")).toBeInTheDocument()
    })
  })

  it('shows "Load more" button when hasNextPage is true', async () => {
    vi.mocked(listTasksPage).mockResolvedValue(
      makeTaskPage({
        items: [makeTask({ id: TEST_TASK_ID_1, title: 'Task Alpha' })],
        nextCursor: 8,
      }),
    )
    renderWithProviders(<TaskListInfinite />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument()
    })
  })

  it('clicking "Load more" fetches and appends the next page', async () => {
    const user = userEvent.setup()
    vi.mocked(listTasksPage)
      .mockResolvedValueOnce(
        makeTaskPage({
          items: [makeTask({ id: TEST_TASK_ID_1, title: 'Task Alpha' })],
          nextCursor: 8,
        }),
      )
      .mockResolvedValueOnce(
        makeTaskPage({
          items: [makeTask({ id: TEST_TASK_ID_2, title: 'Task Beta' })],
          nextCursor: null,
        }),
      )

    renderWithProviders(<TaskListInfinite />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Load more' }))

    await waitFor(() => {
      expect(screen.getByText('Task Alpha')).toBeInTheDocument()
      expect(screen.getByText('Task Beta')).toBeInTheDocument()
    })
  })

  it('shows error message when listTasksPage rejects', async () => {
    vi.mocked(listTasksPage).mockRejectedValue(new Error('Network error'))
    renderWithProviders(<TaskListInfinite />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })
})
