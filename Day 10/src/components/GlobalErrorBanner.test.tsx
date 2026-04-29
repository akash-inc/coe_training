import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlobalErrorBanner } from './GlobalErrorBanner'
import { renderWithProviders } from '../test/renderWithProviders'
import { apiErrorBus } from '../lib/errorBus'

describe('GlobalErrorBanner', () => {
  it('renders nothing when no error has been emitted', () => {
    renderWithProviders(<GlobalErrorBanner />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows error message after apiErrorBus.emit', async () => {
    renderWithProviders(<GlobalErrorBanner />)

    apiErrorBus.emit(new Error('Something went wrong'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    })
  })

  it('shows role="alert" on the banner element', async () => {
    renderWithProviders(<GlobalErrorBanner />)

    apiErrorBus.emit(new Error('boom'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('hides the banner after clicking Dismiss', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GlobalErrorBanner />)

    apiErrorBus.emit(new Error('Dismissible error'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the latest error when multiple errors are emitted', async () => {
    renderWithProviders(<GlobalErrorBanner />)

    apiErrorBus.emit(new Error('First error'))
    apiErrorBus.emit(new Error('Second error'))

    await waitFor(() => {
      expect(screen.getByText(/Second error/)).toBeInTheDocument()
    })
    expect(screen.queryByText(/First error/)).not.toBeInTheDocument()
  })
})
