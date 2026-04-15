import { WeatherSearch } from './WeatherSearch'
import { WeatherResult } from './WeatherResult'
import { useWeather } from '../hooks/useWeather'
import './WeatherFeature.css'

export function WeatherFeature() {
  const { search, data, loading, error } = useWeather()

  return (
    <section className="weather-feature" aria-label="Weather feature">
      <WeatherSearch onSearch={search} />
      {loading ? <p className="weather-feature__loading">Loading...</p> : null}
      {error ? <p className="weather-feature__error">{error}</p> : null}
      {data ? <WeatherResult data={data} /> : null}
    </section>
  )
}
