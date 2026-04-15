import './App.css'
import { WeatherFeature } from './features/weather'

function App() {
  return (
    <main className="app">
      <h1 className="app__title">Weather Search</h1>
      <WeatherFeature />
    </main>
  )
}

export default App
