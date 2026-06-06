import './AuthCallbackScreen.css'

interface AuthCallbackScreenProps {
  message?: string
}

export function AuthCallbackScreen({
  message = 'Completing GitHub sign-in…',
}: AuthCallbackScreenProps) {
  return (
    <main className="auth-callback-screen">
      <section className="panel auth-callback-panel" aria-live="polite">
        <div className="auth-callback-spinner" aria-hidden="true" />
        <h2>GitHub sign-in</h2>
        <p>{message}</p>
      </section>
    </main>
  )
}
