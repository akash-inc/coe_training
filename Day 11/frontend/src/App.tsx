import { useCallback, useEffect, useState } from 'react'
import {
  clearStoredTokens,
  createUser,
  fetchDashboard,
  fetchGithubAuthEnabled,
  fetchTasks,
  fetchUsers,
  getStoredAccessToken,
  getStoredRefreshToken,
  login,
  logout,
  setStoredTokens,
} from './api'
import { githubAuthErrorMessage } from './authErrors'
import { AuthCallbackScreen } from './components/AuthCallbackScreen'
import { AuthPanel } from './components/AuthPanel'
import { Dashboard } from './components/Dashboard'
import { Toast } from './components/Toast'
import { formatRole, hasPermission, isAdmin } from './permissions'
import type { Dashboard as DashboardData, Task, User } from './types'
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
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [githubCallback, setGithubCallback] = useState(path === '/auth/callback')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [githubAuthEnabled, setGithubAuthEnabled] = useState(false)
  const [toast, setToast] = useState({ message: '', isError: false })

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError })
    window.setTimeout(() => setToast({ message: '', isError: false }), 4000)
  }, [])

  const loadData = useCallback(async (taskUserId?: number) => {
    const dashboardData = await fetchDashboard()
    setDashboard(dashboardData)

    const effectiveUserId = taskUserId ?? dashboardData.user.id
    const tasksData = await fetchTasks(
      isAdmin(dashboardData.user.role) ? effectiveUserId : undefined,
    )
    setTasks(tasksData)

    if (hasPermission(dashboardData.user.role, 'users:read')) {
      setUsers(await fetchUsers())
    } else {
      setUsers([])
    }
  }, [])

  const reloadTasksForUser = useCallback(
    async (taskUserId: number) => {
      if (!dashboard) return
      const tasksData = await fetchTasks(isAdmin(dashboard.user.role) ? taskUserId : undefined)
      setTasks(tasksData)
      if (taskUserId === dashboard.user.id) {
        setDashboard(await fetchDashboard())
      }
    },
    [dashboard],
  )

  const bootstrap = useCallback(async () => {
    if (path === '/auth/callback') {
      setGithubCallback(true)
      const params = new URLSearchParams(window.location.search)
      const error = params.get('error')
      window.history.replaceState({}, '', '/auth/callback')

      if (error) {
        clearStoredTokens()
        navigate('/')
        showToast(githubAuthErrorMessage(error), true)
        setGithubCallback(false)
        setLoading(false)
        return
      }

      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      if (!accessToken || !refreshToken) {
        clearStoredTokens()
        navigate('/')
        showToast('GitHub sign-in failed', true)
        setGithubCallback(false)
        setLoading(false)
        return
      }

      try {
        setStoredTokens(accessToken, refreshToken)
        await loadData()
        navigate('/dashboard')
        showToast('Logged in with GitHub')
      } catch {
        clearStoredTokens()
        navigate('/')
        showToast('GitHub sign-in failed', true)
      } finally {
        setGithubCallback(false)
        setLoading(false)
      }
      return
    }

    const hasRefresh = getStoredRefreshToken()
    const hasAccess = getStoredAccessToken()

    if (!hasRefresh && !hasAccess) {
      if (path === '/dashboard') navigate('/')
      setLoading(false)
      return
    }

    try {
      await loadData()
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

  useEffect(() => {
    if (path !== '/' && path !== '/auth/callback') return
    void fetchGithubAuthEnabled().then((result) => setGithubAuthEnabled(result.enabled))
  }, [path])

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
    setUsers([])
    setEmail('')
    setPassword('')
    setName('')
    navigate('/')
  }

  if (loading && githubCallback) {
    return (
      <>
        <header className="site-header">
          <div className="header-inner">
            <h1>Task Manager</h1>
          </div>
        </header>
        <AuthCallbackScreen />
      </>
    )
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
          <AuthPanel
            authMode={authMode}
            githubAuthEnabled={githubAuthEnabled}
            name={name}
            email={email}
            password={password}
            submitting={submitting}
            onAuthModeChange={setAuthMode}
            onNameChange={setName}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleAuthSubmit}
          />
        </main>
      </>
    )
  }

  const signedInViaGithub = Boolean(dashboard.user.github_id)

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <h1>Task Manager</h1>
          <p className="tagline">
            Signed in as {dashboard.user.name} ({formatRole(dashboard.user.role)})
            {signedInViaGithub && <span className="github-linked-badge">GitHub</span>}
          </p>
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
        users={users}
        onReload={reloadTasksForUser}
        onChanged={loadData}
        onError={(message) => showToast(message, true)}
        onSuccess={showToast}
      />
    </>
  )
}

export default App
