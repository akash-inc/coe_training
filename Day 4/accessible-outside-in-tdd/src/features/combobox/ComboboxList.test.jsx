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
})
