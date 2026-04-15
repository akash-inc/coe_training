const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

export function formatWeatherResponse(apiResponse) {
  return {
    city: apiResponse.name,
    temperature: Math.round(apiResponse.main.temp - 273.15),
    unit: 'C',
  }
}

export async function getWeather(city) {
  const apiKey =
    import.meta.env.VITE_OPENWEATHERMAP_API_KEY ??
    import.meta.env.VITE_OPENWEATHER_API_KEY

  if (!apiKey && import.meta.env.MODE !== 'test') {
    throw new Error(
      'Missing OpenWeather API key. Set VITE_OPENWEATHERMAP_API_KEY in .env',
    )
  }

  const query = new URLSearchParams({
    q: city,
  })

  if (apiKey) {
    query.set('appid', apiKey)
  }

  const response = await fetch(`${WEATHER_API_URL}?${query.toString()}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.message
        ? `OpenWeather error: ${data.message}`
        : 'Unable to fetch weather data',
    )
  }

  return formatWeatherResponse(data)
}
