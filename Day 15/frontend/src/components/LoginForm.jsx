import { useState } from 'react'
import './LoginForm.css'

export default function LoginForm({ onSubmit, isPending, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <div className="login-card">
      <div className="login-header">
        <h1>Welcome back</h1>
        <p>Sign in to view your tasks</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="login-error">{error.message}</p>}

        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="login-hint">
        Demo: <code>test@example.com</code> / <code>password</code>
      </p>
    </div>
  )
}
