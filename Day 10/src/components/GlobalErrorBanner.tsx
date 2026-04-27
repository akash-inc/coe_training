import { useApiErrorLog } from '../contexts/ApiErrorLogContext'

export function GlobalErrorBanner() {
  const { lastError, clear } = useApiErrorLog()
  if (!lastError) {
    return null
  }
  return (
    <div
      className="global-error"
      role="alert"
    >
      <p className="global-error__text">
        <strong>API</strong> {lastError.message}
      </p>
      <button type="button" className="global-error__dismiss" onClick={clear}>
        Dismiss
      </button>
    </div>
  )
}
