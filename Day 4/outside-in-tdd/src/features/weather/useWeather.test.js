import { renderHook, act } from '@testing-library/react'
import { useWeather } from './useWeather'

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
