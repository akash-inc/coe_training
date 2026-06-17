import './App.css'
import { SessionContext } from './contexts/SessionContext'
import { useAuth } from './hooks/useAuth'
import LoginForm from './components/LoginForm'
import UserProfile from './components/UserProfile'
import TaskList from './components/TaskList'

function App() {
  const {
    isLoggedIn,
    accessToken,
    user,
    userLoading,
    loginPending,
    loginError,
    handleLogin,
    handleSessionExpired,
  } = useAuth()

  const showDashboardLoading = isLoggedIn && userLoading

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-brand-icon" aria-hidden="true">
            ✓
          </span>
          Task Manager
        </div>
      </header>

      <main className="app-main">
        {!isLoggedIn && (
          <LoginForm onSubmit={handleLogin} isPending={loginPending} error={loginError} />
        )}

        {showDashboardLoading && (
          <div className="app-loading">
            <div className="spinner" aria-hidden="true" />
            <p>Loading your workspace…</p>
          </div>
        )}

        {isLoggedIn && user?.email && (
          <SessionContext.Provider value={handleSessionExpired}>
            <UserProfile user={user} onLogout={handleSessionExpired} />
            <TaskList accessToken={accessToken} userEmail={user.email} />
          </SessionContext.Provider>
        )}
      </main>
    </div>
  )
}

export default App
