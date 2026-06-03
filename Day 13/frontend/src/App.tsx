import { ConcurrencyLab } from './components/ConcurrencyLab'
import './App.css'

function App() {
  return (
    <>
      <header className="site-header">
        <div>
          <h1>Day 13 — Query & Connection Lab</h1>
          <p className="tagline">
            Stress the same FastAPI backend from many parallel browser clients
          </p>
        </div>
        <nav className="header-nav">
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer">
            API docs
          </a>
          <a href="/health" target="_blank" rel="noopener noreferrer">
            Health
          </a>
        </nav>
      </header>

      <main className="page">
        <ConcurrencyLab />
      </main>
    </>
  )
}

export default App
