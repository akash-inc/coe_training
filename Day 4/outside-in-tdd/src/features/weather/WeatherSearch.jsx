import { useState } from 'react'
export function WeatherSearch({ onSearch }) {
  const [city, setCity] = useState('')
  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch(city)
  }
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="city-input">City</label>
      <input
        id="city-input"
        value={city}
        onChange={(event) => setCity(event.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  )
}
