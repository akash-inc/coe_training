import { renderHook, act } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../../mocks/server'
import { useWeather } from './hooks/useWeather'

beforeAll(() => server.listen())

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => server.close())

test('fetches weather for a city and returns formatted data', async () => {
  const { result } = renderHook(() => useWeather())

  expect(result.current.loading).toBe(false)

  await act(async () => {
    await result.current.search('London')
  })

  expect(result.current.data).toEqual({
    city: 'London',
    temperature: 20,
    unit: 'C',
  })
  expect(result.current.loading).toBe(false)
})
