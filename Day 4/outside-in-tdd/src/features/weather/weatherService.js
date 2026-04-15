const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

export function formatWeatherResponse(apiResponse) {
  return {
    city: apiResponse.name,
    temperature: Math.round(apiResponse.main.temp - 273.15),
    unit: 'C',
  }
}

export async function getWeather(city) {
  const response = await fetch(
    `${WEATHER_API_URL}?q=${encodeURIComponent(city)}`,
  )
  const data = await response.json()
  return formatWeatherResponse(data)
}
