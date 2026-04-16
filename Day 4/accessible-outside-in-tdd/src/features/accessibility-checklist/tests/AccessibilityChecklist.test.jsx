import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccessibilityChecklist } from '../components/AccessibilityChecklist'

describe('AccessibilityChecklist', () => {
  it('renders checklist heading and wcag progress summary', () => {
    render(<AccessibilityChecklist />)

    expect(screen.getByRole('heading', { name: 'WCAG 2.1 AA team checklist' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('0')
    expect(screen.getByRole('status')).toHaveTextContent('46')
  })

  it('updates progress when checklist item is marked complete', async () => {
    const user = userEvent.setup()
    render(<AccessibilityChecklist />)

    await user.click(screen.getByRole('checkbox', { name: /text alternatives for non-text content/i }))

    expect(screen.getByRole('status')).toHaveTextContent('1 / 46')
  })

  it('supports incomplete-only filtering', async () => {
    const user = userEvent.setup()
    render(<AccessibilityChecklist />)

    const firstItem = screen.getByRole('checkbox', {
      name: /text alternatives for non-text content/i,
    })

    await user.click(firstItem)
    await user.click(screen.getByRole('checkbox', { name: /show incomplete items only/i }))

    expect(
      screen.queryByRole('checkbox', { name: /text alternatives for non-text content/i }),
    ).not.toBeInTheDocument()
  })
})
