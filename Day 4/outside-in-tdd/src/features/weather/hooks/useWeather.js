import { useState } from 'react'
import { getWeather } from '../services/weatherService'

export function useWeather() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async (city) => {
    setLoading(true)
    setError(null)

    try {
      const weatherData = await getWeather(city)
      setData(weatherData)
    } catch (error) {
      setData(null)
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to fetch weather right now. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    error,
    loading,
    search,
  }
}
