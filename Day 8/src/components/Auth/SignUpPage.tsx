import { useState, type FormEvent } from "react"
import { useAuth } from "../../context/useAuth"
import "./LoginPage.css"

type SignUpPageProps = {
  onRequestSignIn: () => void
}

export default function SignUpPage({ onRequestSignIn }: SignUpPageProps) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pendingEmailSent, setPendingEmailSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setPendingEmailSent(false)
    setSubmitting(true)
    const result = await signUp(email.trim(), password)
    setSubmitting(false)
    if (result.error != null) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      setPendingEmailSent(true)
    }
  }

  if (pendingEmailSent) {
    return (
      <div className="auth-login" role="main">
        <h1 className="auth-login-title">Check your email</h1>
        <p className="auth-login-hint">
          We sent a confirmation link to <strong>{email}</strong>. After you confirm, you can
          sign in.
        </p>
        <p className="auth-login-hint">
          <button
            type="button"
            className="auth-login-text-link"
            onClick={onRequestSignIn}
          >
            Back to sign in
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="auth-login" role="main">
      <h1 className="auth-login-title">Create account</h1>
      <p className="auth-login-hint">
        Sign up with Supabase Auth. You will get a <strong>User</strong> role; an admin can
        promote you in the database if needed.
      </p>
      <form className="auth-login-form" onSubmit={handleSubmit}>
        <label className="auth-login-label" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          className="auth-login-input"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="auth-login-label" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          className="auth-login-input"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
        <p className="auth-login-footer">
          Already have an account?{" "}
          <button
            type="button"
            className="auth-login-text-link"
            onClick={onRequestSignIn}
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  )
}
