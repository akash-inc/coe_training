import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { WeatherSearch } from './WeatherSearch'

test('calls onSearch with the city name when the form is submitted', async () => {
  const user = userEvent.setup()
  const onSearch = vi.fn()

  render(<WeatherSearch onSearch={onSearch} />)

  await user.type(screen.getByRole('textbox', { name: /city/i }), 'London')
  await user.click(screen.getByRole('button', { name: /search/i }))

  expect(onSearch).toHaveBeenCalledWith('London')
})
