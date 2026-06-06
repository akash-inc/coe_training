import { useCallback, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ message: '', isError: false })

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError })
    window.setTimeout(() => setToast({ message: '', isError: false }), 4000)
  }, [])

  return { toast, showToast }
}
