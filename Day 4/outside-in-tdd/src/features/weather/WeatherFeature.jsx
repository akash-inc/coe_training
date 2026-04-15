import { WeatherSearch } from './WeatherSearch'
import { useWeather } from './useWeather'

export function WeatherFeature() {
  const { search, data, loading } = useWeather()

  return (
    <div>
      <WeatherSearch onSearch={search} />
      {loading ? <p>Loading...</p> : null}
      {data ? (
        <div>
          <p>{data.city}</p>
          <p>
            {data.temperature}°{data.unit}
          </p>
        </div>
      ) : null}
    </div>
  )
}
