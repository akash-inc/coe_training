import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { login, logout } from './api/auth'
import { queryKeys } from './api/queryKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UnauthorizedError } from './lib/apiClient'
import { getAccessToken, setTokens } from './lib/tokenStorage'
import { fetchMe } from './api/user'
import LoginForm from './components/LoginForm'
import UserProfile from './components/UserProfile'
import TaskList from './components/TaskList'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAccessToken())
  const [accessToken, setAccessToken] = useState(() => getAccessToken())
  const queryClient = useQueryClient()

  const handleSessionExpired = useCallback(async () => {
    await logout()
    setAccessToken(null)
    setIsLoggedIn(false)
    queryClient.removeQueries({ queryKey: queryKeys.me })
    queryClient.removeQueries({ queryKey: queryKeys.tasks })
    queryClient.removeQueries({ queryKey: ['comments'] })
  }, [queryClient])

  const { mutate, isPending, error: loginError } = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      setAccessToken(data.access_token)
      setIsLoggedIn(true)
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
    },
  })

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    enabled: isLoggedIn,
    retry: (_, error) => !(error instanceof UnauthorizedError),
  })

  useEffect(() => {
    if (userError instanceof UnauthorizedError) {
      queueMicrotask(() => {
        void handleSessionExpired()
      })
    }
  }, [userError, handleSessionExpired])

  function handleSubmit({ email, password }) {
    mutate({ email, password })
  }

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
          <LoginForm onSubmit={handleSubmit} isPending={isPending} error={loginError} />
        )}

        {showDashboardLoading && (
          <div className="app-loading">
            <div className="spinner" aria-hidden="true" />
            <p>Loading your workspace…</p>
          </div>
        )}

        {isLoggedIn && user?.email && (
          <>
            <UserProfile user={user} onLogout={handleSessionExpired} />
            <TaskList
              onSessionExpired={handleSessionExpired}
              accessToken={accessToken}
              userEmail={user.email}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App
