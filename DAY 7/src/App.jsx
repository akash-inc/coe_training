import { Suspense, lazy } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import HomePage from './routes/HomePage.jsx'
import './App.css'

const ExercisePlaygroundRoute = lazy(
  () => import('./routes/ExercisePlaygroundRoute.jsx'),
)

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>React Performance Exercises</h1>
        <p>Exercise-only learning path using the existing app as playground.</p>
        <nav className="app-nav">
          <Link to="/">Home</Link>
          <Link to="/playground">Playground</Link>
        </nav>
      </header>
      <Suspense fallback={<section className="panel">Loading playground...</section>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/playground" element={<ExercisePlaygroundRoute />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
