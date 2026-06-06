import { AuthCallbackScreen } from './components/AuthCallbackScreen'
import { AuthPanel } from './components/AuthPanel'
import { Dashboard } from './components/Dashboard'
import { SiteHeader } from './components/SiteHeader'
import { Toast } from './components/Toast'
import { useAppData } from './hooks/useAppData'
import { usePathname } from './hooks/usePathname'
import { useSession } from './hooks/useSession'
import { useToast } from './hooks/useToast'
import { formatRole } from './permissions'
import './App.css'

function App() {
  const { path, navigate } = usePathname()
  const { toast, showToast } = useToast()
  const { dashboard, tasks, users, loadData, reloadTasksForUser, clearData } = useAppData()
  const { loading, githubCallback, githubAuthEnabled, signOut, onLoginSuccess } = useSession({
    path,
    navigate,
    loadData,
    clearData,
    showToast,
  })

  if (loading && githubCallback) {
    return (
      <>
        <SiteHeader />
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
        <SiteHeader tagline={<p className="tagline">Day 11 — FastAPI + Vite React</p>} />
        <Toast message={toast.message} isError={toast.isError} />
        <main className="auth-layout">
          <AuthPanel
            githubAuthEnabled={githubAuthEnabled}
            onLoginSuccess={onLoginSuccess}
            onSuccess={showToast}
            onError={(message) => showToast(message, true)}
          />
        </main>
      </>
    )
  }

  const signedInViaGithub = Boolean(dashboard.user.github_id)

  return (
    <>
      <SiteHeader
        tagline={
          <p className="tagline">
            Signed in as {dashboard.user.name} ({formatRole(dashboard.user.role)})
            {signedInViaGithub && <span className="github-linked-badge">GitHub</span>}
          </p>
        }
        nav={
          <nav className="header-nav">
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer">
              API docs
            </a>
            <a href="/health" target="_blank" rel="noopener noreferrer">
              Health
            </a>
            <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
              Log out
            </button>
          </nav>
        }
      />

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
