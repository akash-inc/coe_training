import './Toast.css'

interface ToastProps {
  message: string
  isError?: boolean
}

export function Toast({ message, isError = false }: ToastProps) {
  if (!message) return null

  return (
    <div className={`toast ${isError ? 'toast-error' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
