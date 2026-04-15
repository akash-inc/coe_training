import { useState } from 'react'
import { getWeather } from './weatherService'

export function useWeather() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const search = async (city) => {
    setLoading(true)
    const weatherData = await getWeather(city)
    setData(weatherData)
    setLoading(false)
  }

  return {
    data,
    loading,
    search,
  }
}