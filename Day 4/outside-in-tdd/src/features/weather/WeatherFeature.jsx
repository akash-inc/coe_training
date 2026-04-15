import { WeatherSearch } from './WeatherSearch'

export function WeatherFeature() {
  const handleSearch = () => {}

  return (
    <div>
      <WeatherSearch onSearch={handleSearch} />
    </div>
  )
}
