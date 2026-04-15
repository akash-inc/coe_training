import { afterAll, afterEach, beforeAll, expect, test } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import { getWeather } from './services/weatherService'

beforeAll(() => server.listen())

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => server.close())

test('fetches weather for a city and returns display-ready data', async () => {
  let requestedCity = null

  server.use(
    http.get('https://api.openweathermap.org/data/2.5/weather', ({ request }) => {
      requestedCity = new URL(request.url).searchParams.get('q')
      return HttpResponse.json({ name: 'London', main: { temp: 293.15 } })
    }),
  )

  const result = await getWeather('London')

  expect(requestedCity).toBe('London')
  expect(result).toEqual({
    city: 'London',
    temperature: 20,
    unit: 'C',
  })
})
