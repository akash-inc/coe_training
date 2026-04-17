import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import MultiStepApplicationForm from '../components/MultiStepApplicationForm'

describe('MultiStepApplicationForm — full journey', () => {
  it('allows a user to complete all 4 steps and submit successfully', async () => {
    const user = userEvent.setup()
    render(<MultiStepApplicationForm onSubmit={vi.fn()} />)

    // Personal details ──────────────────────────────────────
    expect(screen.getByRole('heading', { name: /personal details/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Step 1 of 4')

    await user.type(screen.getByLabelText(/full name/i), 'Ramesh Pathan')
    await user.type(screen.getByLabelText(/email/i), 'ramesh@example.com')
    await user.type(screen.getByLabelText(/phone/i), '9876543210')

    await user.click(screen.getByRole('button', { name: /next/i }))

    // Role preferences ──────────────────────────────────────
    expect(screen.getByRole('heading', { name: /role preferences/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 4')

    await user.type(screen.getByLabelText(/desired role/i), 'Frontend Engineer')
    await user.selectOptions(screen.getByLabelText(/work type/i), 'remote')
    await user.type(screen.getByLabelText(/expected salary/i), '120000')

    await user.click(screen.getByRole('button', { name: /next/i }))

    // Resume details ────────────────────────────────────────
    expect(screen.getByRole('heading', { name: /resume details/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Step 3 of 4')

    await user.type(screen.getByLabelText(/linkedin/i), 'linkedin.com/in/ramesh')
    await user.type(screen.getByLabelText(/summary/i), 'Experienced frontend developer.')

    await user.click(screen.getByRole('button', { name: /next/i }))

    // Review + submit ───────────────────────────────────────
    expect(screen.getByRole('heading', { name: /review/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Step 4 of 4')

    // All entered data must be visible for review
    expect(screen.getByText('Ramesh Pathan')).toBeInTheDocument()
    expect(screen.getByText('ramesh@example.com')).toBeInTheDocument()
    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Success must be announced via a live region
    expect(screen.getByRole('status')).toHaveTextContent(/application submitted/i)
  })
})