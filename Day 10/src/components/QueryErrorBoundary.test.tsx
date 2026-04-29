import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryErrorBoundary } from './QueryErrorBoundary'

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('render error')
  return <div>Child content OK</div>
}

describe('QueryErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.mocked(console.error).mockRestore()
  })

  it('renders children normally when no error is thrown', () => {
    render(
      <QueryErrorBoundary onReset={vi.fn()} fallback={() => <div>Fallback</div>}>
        <ThrowingChild shouldThrow={false} />
      </QueryErrorBoundary>,
    )

    expect(screen.getByText('Child content OK')).toBeInTheDocument()
    expect(screen.queryByText('Fallback')).not.toBeInTheDocument()
  })

  it('renders fallback with error message when child throws', () => {
    render(
      <QueryErrorBoundary
        onReset={vi.fn()}
        fallback={({ error }) => <div role="alert">{error.message}</div>}
      >
        <ThrowingChild shouldThrow={true} />
      </QueryErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('render error')).toBeInTheDocument()
    expect(screen.queryByText('Child content OK')).not.toBeInTheDocument()
  })

  it('passes the thrown error object to the fallback', () => {
    const capturedErrors: Error[] = []

    render(
      <QueryErrorBoundary
        onReset={vi.fn()}
        fallback={({ error }) => {
          capturedErrors.push(error)
          return <div>Fallback</div>
        }}
      >
        <ThrowingChild shouldThrow={true} />
      </QueryErrorBoundary>,
    )

    expect(capturedErrors[0]).toBeInstanceOf(Error)
    expect(capturedErrors[0].message).toBe('render error')
  })

  it('calls onReset when reset is clicked and hides the fallback', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()

    render(
      <QueryErrorBoundary
        onReset={onReset}
        fallback={({ reset }) => (
          <div>
            <span>Fallback shown</span>
            <button onClick={reset}>Retry</button>
          </div>
        )}
      >
        <ThrowingChild shouldThrow={true} />
      </QueryErrorBoundary>,
    )

    expect(screen.getByText('Fallback shown')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onReset).toHaveBeenCalledOnce()
  })
})
