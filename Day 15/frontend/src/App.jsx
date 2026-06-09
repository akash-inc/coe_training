import { useState } from 'react'
import './App.css'
import { login } from './api/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clearAccessToken, getAccessToken, setAccessToken } from './lib/tokenStorage'
import { fetchMe } from './api/user'
import LoginForm from './components/LoginForm'
import UserProfile from './components/UserProfile'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAccessToken())
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      setAccessToken(data.access_token)
      setIsLoggedIn(true)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: isLoggedIn,
  })

  function handleSubmit({ email, password }) {
    console.log('handleSubmit', email, password)
    mutate({ email, password })
  }

  function handleLogout() {
    clearAccessToken()
    setIsLoggedIn(false)
    queryClient.removeQueries({ queryKey: ['me'] })
  }

  return (
    <>
      <section id="center">
        {!isLoggedIn && (
          <LoginForm onSubmit={handleSubmit} />
        )}
        {isLoggedIn && user?.email && (
          <UserProfile user={user} onLogout={handleLogout} />
        )}
      </section>
    </>
  )
}

export default App
