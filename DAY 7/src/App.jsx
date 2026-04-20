import { Suspense, lazy } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import HomePage from './routes/HomePage.jsx'
import './App.css'

const ExercisePlaygroundRoute = lazy(
  () => import('./routes/ExercisePlaygroundRoute.jsx'),
)
const DashboardLabRoute = lazy(() => import('./routes/DashboardLabRoute.jsx'))

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>React Performance Exercises</h1>
        <p>Exercise-only learning path using the existing app as playground.</p>
        <nav className="app-nav">
          <Link to="/">Home</Link>
          <Link to="/playground">Playground</Link>
          <Link to="/dashboard-lab">Dashboard Lab</Link>
        </nav>
      </header>
      <Suspense fallback={<section className="panel">Loading playground...</section>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/playground" element={<ExercisePlaygroundRoute />} />
          <Route path="/dashboard-lab" element={<DashboardLabRoute />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
