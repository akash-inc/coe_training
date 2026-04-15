import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeatherFeature } from './components/WeatherFeature'
import { server } from '../../mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('user can search for weather in a city and see the temperature', async () => {
  const user = userEvent.setup()
  render(<WeatherFeature />)

  await user.type(screen.getByRole('textbox', { name: /city/i }), 'London')
  await user.click(screen.getByRole('button', { name: /search/i }))

  expect(await screen.findByText(/london/i)).toBeInTheDocument()
  expect(await screen.findByText(/20°c/i)).toBeInTheDocument()
})
