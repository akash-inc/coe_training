import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiErrorLogContext, type ApiErrorEntry } from './ApiErrorLogContextBase'
import { setApiErrorSink } from '../lib/apiErrorSink'

let counter = 0
function nextId() {
  counter += 1
  return `e-${Date.now()}-${counter}`
}

export type { ApiErrorEntry } from './ApiErrorLogContextBase'

type ApiErrorLog = {
  entries: readonly ApiErrorEntry[]
  log: (error: Error, meta?: { kind: ApiErrorEntry['kind']; label?: string }) => void
  clear: () => void
}

export function ApiErrorLogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ApiErrorEntry[]>([])

  const log = useCallback((error: Error, meta?: { kind: ApiErrorEntry['kind']; label?: string }) => {
    setEntries((prev) => {
      const e: ApiErrorEntry = {
        id: nextId(),
        at: Date.now(),
        message: error.message,
        kind: meta?.kind ?? 'query',
        label: meta?.label,
      }
      return [e, ...prev].slice(0, 12)
    })
  }, [])

  const clear = useCallback(() => {
    setEntries([])
  }, [])

  const value = useMemo<ApiErrorLog>(
    () => ({ entries, log, clear }),
    [entries, log, clear],
  )

  useLayoutEffect(() => {
    setApiErrorSink((err, meta) => {
      log(err, meta)
    })
    return () => {
      setApiErrorSink(null)
    }
  }, [log])

  return <ApiErrorLogContext.Provider value={value}>{children}</ApiErrorLogContext.Provider>
}
