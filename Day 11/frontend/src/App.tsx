import { useCallback, useEffect, useState } from 'react'
import {
  clearStoredTokens,
  createUser,
  fetchDashboard,
  fetchTasks,
  getStoredAccessToken,
  getStoredRefreshToken,
  login,
  logout,
  setStoredTokens,
} from './api'
import { Dashboard } from './components/Dashboard'
import { Toast } from './components/Toast'
import type { Dashboard as DashboardData, Task } from './types'
import './App.css'

function usePathname() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, '', to)
    setPath(to)
  }, [])

  return { path, navigate }
}

function App() {
  const { path, navigate } = usePathname()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
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
    const [dashboardData, tasksData] = await Promise.all([fetchDashboard(), fetchTasks()])
    setDashboard(dashboardData)
    setTasks(tasksData)
  }, [])

  const bootstrap = useCallback(async () => {
    const hasRefresh = getStoredRefreshToken()
    const hasAccess = getStoredAccessToken()
  
    if (!hasRefresh && !hasAccess) {
      if (path === '/dashboard') navigate('/')
      setLoading(false)
      return
    }
  
    try {
      await loadData()  // request() will auto-refresh on 401
      if (path !== '/dashboard') navigate('/dashboard')
    } catch {
      clearStoredTokens()
      setDashboard(null)
      navigate('/')
      showToast('Session expired', true)
    } finally {
      setLoading(false)
    }
  }, [loadData, navigate, path, showToast])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore session once on mount
    void bootstrap()
  }, [bootstrap])

  async function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (authMode === 'register') {
        await createUser({ name, email, password })
      }
      const tokenResponse = await login(email, password)
      setStoredTokens(tokenResponse.access_token, tokenResponse.refresh_token)
      setName('')
      setPassword('')
      await loadData()
      navigate('/dashboard')
      showToast(authMode === 'register' ? 'Account created' : 'Logged in')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Authentication failed', true)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLogout() {
    await logout()
    setDashboard(null)
    setTasks([])
    setEmail('')
    setPassword('')
    setName('')
    navigate('/')
  }

  if (loading) {
    return <p className="loading">Loading…</p>
  }

  if (!dashboard || path !== '/dashboard') {
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
                  minLength={8}
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
          <p className="tagline">Signed in as {dashboard.user.name}</p>
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

      <Dashboard
        dashboard={dashboard}
        tasks={tasks}
        onChanged={loadData}
        onError={(message) => showToast(message, true)}
        onSuccess={showToast}
      />
    </>
  )
}

export default App
