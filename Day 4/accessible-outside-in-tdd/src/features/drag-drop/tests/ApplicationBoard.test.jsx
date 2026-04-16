import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApplicationBoard } from '../components/ApplicationBoard'

describe('ApplicationBoard', () => {
  it('renders pipeline columns as labeled regions', () => {
    render(<ApplicationBoard />)

    expect(screen.getByRole('heading', { name: 'Application board' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Saved' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Applied' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Interview' })).toBeInTheDocument()
  })

  it('moves cards within a column and announces the action', async () => {
    const user = userEvent.setup()
    render(<ApplicationBoard />)

    await user.click(
      screen.getByRole('button', { name: /move options for frontend engineer at acme labs/i }),
    )
    await user.click(screen.getByRole('button', { name: 'Move down' }))

    const savedColumn = screen.getByRole('region', { name: 'Saved' })
    const savedCards = within(savedColumn).getAllByRole('heading', { level: 4 })
    expect(savedCards[0]).toHaveTextContent('Accessibility Specialist')
    expect(savedCards[1]).toHaveTextContent('Frontend Engineer')

    expect(screen.getByRole('status')).toHaveTextContent(
      'Frontend Engineer at Acme Labs moved down in Saved.',
    )
  })

  it('moves cards to the next column and announces destination', async () => {
    const user = userEvent.setup()
    render(<ApplicationBoard />)

    await user.click(
      screen.getByRole('button', {
        name: /move options for frontend engineer at acme labs/i,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Move to Applied' }))

    const appliedColumn = screen.getByRole('region', { name: 'Applied' })
    expect(
      within(appliedColumn).getByRole('heading', { level: 4, name: 'Frontend Engineer' }),
    ).toBeInTheDocument()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Frontend Engineer at Acme Labs moved to Applied column.',
    )
  })

  it('shows only available move actions for each card', async () => {
    const user = userEvent.setup()
    render(<ApplicationBoard />)

    await user.click(
      screen.getByRole('button', { name: /move options for frontend engineer at acme labs/i }),
    )
    expect(
      screen.queryByRole('button', { name: 'Move up' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move down' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Move to Saved' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move to Applied' })).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /move options for ui engineer at brighttech/i }),
    )
    expect(
      screen.queryByRole('button', { name: 'Move to next column' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move to Applied' })).toBeInTheDocument()
  })
})
