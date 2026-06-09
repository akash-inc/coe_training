import { useState } from 'react'
import './App.css'
import { login } from './api/auth'
import { useMutation } from '@tanstack/react-query'
import { setAccessToken } from './lib/tokenStorage'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { mutate } = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => setAccessToken(data.access_token),
    onError: (error) => console.error("Error:", error),
  })

  return (
    <>
      <section id="center">
        <h1>Login</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" onClick={() => mutate({ email, password })}>
            Login
          </button>
        </form>
      </section>
    </>
  )
}

export default App
