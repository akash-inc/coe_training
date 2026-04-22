import { useState, type FormEvent } from "react"
import { useAuth } from "../../context/useAuth"
import "./LoginPage.css"

type LoginPageProps = {
  onRequestSignUp: () => void
}

export default function LoginPage({ onRequestSignUp }: LoginPageProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: signError } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (signError != null) {
      setError(signError)
    }
  }

  return (
    <div className="auth-login" role="main">
      <h1 className="auth-login-title">Sign in</h1>
      <p className="auth-login-hint">Use the email and password from your Supabase project.</p>
      <form className="auth-login-form" onSubmit={handleSubmit}>
        <label className="auth-login-label" htmlFor="auth-email">
          Email
        </label>
        <input
          id="auth-email"
          className="auth-login-input"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="auth-login-label" htmlFor="auth-password">
          Password
        </label>
        <input
          id="auth-password"
          className="auth-login-input"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error != null ? (
          <p className="auth-login-error" role="alert">
            {error}
          </p>
        ) : null}
        <button
          className="auth-login-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
        <p className="auth-login-footer">
          No account?{" "}
          <button
            type="button"
            className="auth-login-text-link"
            onClick={onRequestSignUp}
          >
            Create one
          </button>
        </p>
      </form>
    </div>
  )
}
