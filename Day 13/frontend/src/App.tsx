import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { ConcurrencyLab } from './components/ConcurrencyLab'
import { OrmVsRawLab } from './components/OrmVsRawLab'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <div>
          <h1>Day 13 — Query & Connection Lab</h1>
          <p className="tagline">
            Stress the same FastAPI backend from many parallel browser clients
          </p>
        </div>
        <nav className="header-nav">
          <NavLink to="/" end>
            Query lab
          </NavLink>
          <NavLink to="/orm-vs-raw">ORM vs raw</NavLink>
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer">
            API docs
          </a>
          <a href="/health" target="_blank" rel="noopener noreferrer">
            Health
          </a>
        </nav>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<ConcurrencyLab />} />
          <Route path="/orm-vs-raw" element={<OrmVsRawLab />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
