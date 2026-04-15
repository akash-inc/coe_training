export function WeatherResult({ data }) {
  return (
    <div className="weather-result" aria-live="polite">
      <p className="weather-result__city">{data.city}</p>
      <p className="weather-result__temperature">
        {data.temperature}°{data.unit}
      </p>
    </div>
  )
}
