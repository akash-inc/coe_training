import { createContext } from 'react'

export type ApiErrorEntry = {
  id: string
  at: number
  message: string
  label?: string
  kind: 'query' | 'mutation'
}

type ApiErrorLog = {
  entries: readonly ApiErrorEntry[]
  log: (error: Error, meta?: { kind: ApiErrorEntry['kind']; label?: string }) => void
  clear: () => void
}

export const ApiErrorLogContext = createContext<ApiErrorLog | null>(null)
