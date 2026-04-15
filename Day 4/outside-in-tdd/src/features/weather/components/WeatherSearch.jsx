import { useState } from 'react'

export function WeatherSearch({ onSearch }) {
  const [city, setCity] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch(city)
  }

  return (
    <form className="weather-search" onSubmit={handleSubmit}>
      <label className="weather-search__label" htmlFor="city-input">
        City
      </label>
      <input
        className="weather-search__input"
        id="city-input"
        value={city}
        onChange={(event) => setCity(event.target.value)}
      />
      <button className="weather-search__button" type="submit">
        Search
      </button>
    </form>
  )
}
