import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTaskForm } from './CreateTaskForm'
import { renderWithProviders } from '../test/renderWithProviders'
import { makeTask } from '../test/fixtures'
import { taskKeys } from '../lib/queryKeys'
import { createTaskLocal } from '../api/unified'

vi.mock('../api/unified', () => ({
  getWorkspaceId: () => '20000000-0000-4000-8000-000000000001',
  createTaskLocal: vi.fn(),
}))

describe('CreateTaskForm', () => {
  beforeEach(() => {
    vi.mocked(createTaskLocal).mockResolvedValue(makeTask({ title: 'My New Task' }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders an input and a submit button', () => {
    renderWithProviders(<CreateTaskForm />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('has the Add button disabled when the input is empty', () => {
    renderWithProviders(<CreateTaskForm />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('enables the Add button when the input has text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateTaskForm />)

    await user.type(screen.getByRole('textbox'), 'New task title')

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
  })

  it('calls createTaskLocal with the trimmed title on submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateTaskForm />)

    await user.type(screen.getByRole('textbox'), '  My New Task  ')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(vi.mocked(createTaskLocal)).toHaveBeenCalledWith({
        title: 'My New Task',
        status: 'open',
        assignee: null,
      })
    })
  })

  it('clears the input after successful submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateTaskForm />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'My New Task')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('calls invalidateQueries for taskKeys.all after submission', async () => {
    const user = userEvent.setup()
    const { queryClient } = renderWithProviders(<CreateTaskForm />)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await user.type(screen.getByRole('textbox'), 'My New Task')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: taskKeys.all() }),
      )
    })
  })
})
