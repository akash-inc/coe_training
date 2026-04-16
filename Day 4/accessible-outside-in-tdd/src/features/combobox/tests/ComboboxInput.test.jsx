import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ComboboxInput } from '../components/ComboboxInput'

describe('ComboboxInput', () => {
  it('renders an accessible combobox and forwards typing changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <ComboboxInput
        inputId="job-role-search"
        label="Search roles"
        value=""
        isExpanded={false}
        controlsId="job-role-list"
        activeDescendantId={undefined}
        onChange={handleChange}
        onKeyDown={() => {}}
      />,
    )

    const input = screen.getByRole('combobox', { name: /search roles/i })
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-expanded', 'false')

    await user.type(input, 'front')
    expect(handleChange).toHaveBeenCalled()
  })
})
