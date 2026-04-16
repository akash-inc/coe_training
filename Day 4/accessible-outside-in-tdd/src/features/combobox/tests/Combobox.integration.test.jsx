import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComboboxFeature } from '../components/ComboboxFeature'

describe('Combobox integration', () => {
  it('lets a JobTrail user search roles and commit one suggestion with keyboard', async () => {
    const user = userEvent.setup()

    render(<ComboboxFeature />)

    const input = screen.getByRole('combobox', { name: /search roles/i })
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-expanded', 'false')

    await user.type(input, 'front')

    const listbox = screen.getByRole('listbox')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    const options = within(listbox).getAllByRole('option')
    const optionTexts = options.map((option) => option.textContent?.trim())
    expect(optionTexts).toEqual(['Frontend Developer'])

    await user.keyboard('{ArrowDown}')

    const activeDescendantId = input.getAttribute('aria-activedescendant')
    expect(activeDescendantId).toBeTruthy()

    const activeOption = document.getElementById(activeDescendantId)
    expect(activeOption).not.toBeNull()

    const committedValue = activeOption?.textContent ?? ''
    expect(activeOption).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Enter}')

    expect(input).toHaveValue(committedValue)
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
