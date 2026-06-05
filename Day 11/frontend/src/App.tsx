import { useCallback, useEffect, useState } from 'react'
import {
  clearStoredToken,
  createUser,
  fetchCurrentUser,
  fetchTasks,
  fetchUsers,
  getStoredToken,
  login,
  setStoredToken,
} from './api'
import { TaskPanel } from './components/TaskPanel'
import { Toast } from './components/Toast'
import { UserPanel } from './components/UserPanel'
import type { Task, User } from './types'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ message: '', isError: false })

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError })
    window.setTimeout(() => setToast({ message: '', isError: false }), 4000)
  }, [])

  const loadData = useCallback(async () => {
    const [current, usersData, tasksData] = await Promise.all([
      fetchCurrentUser(),
      fetchUsers(),
      fetchTasks(),
    ])
    setCurrentUser(current)
    setUsers(usersData)
    setTasks(tasksData)
  }, [])

  const bootstrap = useCallback(async () => {
    if (!getStoredToken()) {
      setLoading(false)
      return
    }

    try {
      await loadData()
    } catch (error) {
      clearStoredToken()
      setCurrentUser(null)
      showToast(error instanceof Error ? error.message : 'Session expired', true)
    } finally {
      setLoading(false)
    }
  }, [loadData, showToast])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  async function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (authMode === 'register') {
        await createUser({ name, email, password })
      }
      const tokenResponse = await login(email, password)
      setStoredToken(tokenResponse.access_token)
      setName('')
      setPassword('')
      await loadData()
      showToast(authMode === 'register' ? 'Account created' : 'Logged in')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Authentication failed', true)
    } finally {
      setSubmitting(false)
    }
  }

  function handleLogout() {
    clearStoredToken()
    setCurrentUser(null)
    setUsers([])
    setTasks([])
    setEmail('')
    setPassword('')
    setName('')
  }

  if (loading) {
    return <p className="loading">Loading…</p>
  }

  if (!currentUser) {
    return (
      <>
        <header className="site-header">
          <div className="header-inner">
            <h1>Task Manager</h1>
            <p className="tagline">Day 11 — FastAPI + Vite React</p>
          </div>
        </header>
        <Toast message={toast.message} isError={toast.isError} />
        <main className="auth-layout">
          <section className="panel auth-panel">
            <div className="panel-head">
              <h2>{authMode === 'login' ? 'Log in' : 'Create account'}</h2>
            </div>
            <form className="form-grid" onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <label>
                  Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={1}
                    maxLength={255}
                  />
                </label>
              )}
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  minLength={3}
                  maxLength={255}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={128}
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? 'Please wait…'
                  : authMode === 'login'
                    ? 'Log in'
                    : 'Create account'}
              </button>
            </form>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'Need an account? Register' : 'Already have an account? Log in'}
            </button>
          </section>
        </main>
      </>
    )
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <h1>Task Manager</h1>
          <p className="tagline">Signed in as {currentUser.name}</p>
        </div>
        <nav className="header-nav">
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer">
            API docs
          </a>
          <a href="/health" target="_blank" rel="noopener noreferrer">
            Health
          </a>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>

      <Toast message={toast.message} isError={toast.isError} />

      <main className="layout">
        <UserPanel
          users={users}
          onCreated={loadData}
          onError={(message) => showToast(message, true)}
        />
        <TaskPanel
          currentUser={currentUser}
          tasks={tasks}
          onChanged={loadData}
          onError={(message) => showToast(message, true)}
          onSuccess={showToast}
        />
      </main>
    </>
  )
}

export default App
