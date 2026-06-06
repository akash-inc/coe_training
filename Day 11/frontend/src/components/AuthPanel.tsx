import { useState } from 'react'
import { createUser, login, setStoredTokens } from '../api'
import { GithubSignInButton } from './GithubSignInButton'
import './AuthPanel.css'

interface AuthPanelProps {
  githubAuthEnabled: boolean
  onLoginSuccess: () => Promise<void>
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function AuthPanel({
  githubAuthEnabled,
  onLoginSuccess,
  onSuccess,
  onError,
}: AuthPanelProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)

    try {
      if (authMode === 'register') {
        await createUser({ name, email, password })
      }
      const tokens = await login(email, password)
      setStoredTokens(tokens.access_token, tokens.refresh_token)
      setName('')
      setPassword('')
      await onLoginSuccess()
      onSuccess(authMode === 'register' ? 'Account created' : 'Logged in')
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  const githubLabel = authMode === 'login' ? 'Sign in with GitHub' : 'Continue with GitHub'

  return (
    <section className="panel auth-panel">
      <div className="panel-head">
        <h2>{authMode === 'login' ? 'Log in' : 'Create account'}</h2>
      </div>

      {githubAuthEnabled && (
        <>
          <GithubSignInButton label={githubLabel} />
          <p className="auth-divider">
            <span>or use email</span>
          </p>
        </>
      )}

      <form className="form-grid" onSubmit={handleSubmit}>
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
              ? 'Log in with email'
              : 'Create account with email'}
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
  )
}
