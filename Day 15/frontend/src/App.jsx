import { useEffect, useState } from 'react'
import './App.css'
import { login } from './api/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UnauthorizedError } from './lib/apiClient'
import { clearAccessToken, getAccessToken, setAccessToken } from './lib/tokenStorage'
import { fetchMe } from './api/user'
import LoginForm from './components/LoginForm'
import UserProfile from './components/UserProfile'
import TaskList from './components/TaskList'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAccessToken())
  const queryClient = useQueryClient()

  function handleSessionExpired() {
    clearAccessToken()
    setIsLoggedIn(false)
    queryClient.removeQueries({ queryKey: ['me'] })
    queryClient.removeQueries({ queryKey: ['tasks'] })
  }

  const { mutate } = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      setAccessToken(data.access_token)
      setIsLoggedIn(true)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const { data: user, error: userError } = useQuery({
    queryKey: ['me'],
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
