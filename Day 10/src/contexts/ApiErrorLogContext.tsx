import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiErrorBus } from '../lib/errorBus'

type ApiErrorLogContextValue = {
  lastError: Error | null
  clear: () => void
}

const ApiErrorLogContext = createContext<ApiErrorLogContextValue | null>(null)

export function ApiErrorLogProvider({ children }: { children: ReactNode }) {
  const [lastError, setLastError] = useState<Error | null>(null)

  useEffect(() => {
    return apiErrorBus.subscribe((e) => {
      setLastError(e)
    })
  }, [])

  const clear = useCallback(() => {
    setLastError(null)
  }, [])

  const value = useMemo(() => ({ lastError, clear }), [lastError, clear])

  return <ApiErrorLogContext.Provider value={value}>{children}</ApiErrorLogContext.Provider>
}

/** Colocated with provider to keep a single import path for training code. */
// eslint-disable-next-line react-refresh/only-export-components -- hook + provider pair
export function useApiErrorLog(): ApiErrorLogContextValue {
  const v = useContext(ApiErrorLogContext)
  if (!v) {
    throw new Error('useApiErrorLog must be used under ApiErrorLogProvider')
  }
  return v
}
