import { GithubSignInButton } from './GithubSignInButton'
import './AuthPanel.css'

interface AuthPanelProps {
  authMode: 'login' | 'register'
  githubAuthEnabled: boolean
  name: string
  email: string
  password: string
  submitting: boolean
  onAuthModeChange: (mode: 'login' | 'register') => void
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
}

export function AuthPanel({
  authMode,
  githubAuthEnabled,
  name,
  email,
  password,
  submitting,
  onAuthModeChange,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthPanelProps) {
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

      <form className="form-grid" onSubmit={onSubmit}>
        {authMode === 'register' && (
          <label>
            Name
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
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
            onChange={(e) => onEmailChange(e.target.value)}
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
            onChange={(e) => onPasswordChange(e.target.value)}
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
        onClick={() => onAuthModeChange(authMode === 'login' ? 'register' : 'login')}
      >
        {authMode === 'login' ? 'Need an account? Register' : 'Already have an account? Log in'}
      </button>
    </section>
  )
}
