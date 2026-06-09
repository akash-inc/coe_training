import { useEffect, useState } from 'react'
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
  const queryClient = useQueryClient()

  async function handleSessionExpired() {
    await logout()
    setIsLoggedIn(false)
    queryClient.removeQueries({ queryKey: queryKeys.me })
    queryClient.removeQueries({ queryKey: queryKeys.tasks })
  }

  const { mutate } = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      setIsLoggedIn(true)
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
    },
  })

  const { data: user, error: userError } = useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    enabled: isLoggedIn,
    retry: (_, error) => !(error instanceof UnauthorizedError),
  })

  useEffect(() => {
    if (userError instanceof UnauthorizedError) {
      handleSessionExpired()
    }
  }, [userError])

  function handleSubmit({ email, password }) {
    mutate({ email, password })
  }

  return (
    <>
      <section id="center">
        {!isLoggedIn && <LoginForm onSubmit={handleSubmit} />}
        {isLoggedIn && user?.email && (
          <UserProfile user={user} onLogout={handleSessionExpired} />
        )}
        {isLoggedIn && <TaskList onSessionExpired={handleSessionExpired} />}
      </section>
    </>
  )
}

export default App
