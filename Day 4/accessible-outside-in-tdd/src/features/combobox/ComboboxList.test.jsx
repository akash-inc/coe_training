import { render, screen } from '@testing-library/react'
import { ComboboxList } from './components/ComboboxList'

describe('ComboboxList', () => {
  it('does not render listbox when there are no options', () => {
    render(
      <ComboboxList
        listboxId="job-role-list"
        optionIdPrefix="job-role-option"
        options={[]}
        activeIndex={-1}
      />,
    )

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('renders a listbox with options and marks active option as selected', () => {
    render(
      <ComboboxList
        listboxId="job-role-list"
        optionIdPrefix="job-role-option"
        options={['Frontend Developer', 'Backend Developer']}
        activeIndex={0}
      />,
    )

    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveAttribute('id', 'job-role-list')

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveAttribute('id', 'job-role-option-0')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    expect(options[1]).toHaveAttribute('aria-selected', 'false')
  })

})
