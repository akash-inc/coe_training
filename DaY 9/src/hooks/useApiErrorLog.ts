import { useContext } from 'react'
import { ApiErrorLogContext } from '../contexts/ApiErrorLogContextBase'

export function useApiErrorLog() {
  const ctx = useContext(ApiErrorLogContext)
  if (!ctx) {
    throw new Error('useApiErrorLog must be used under ApiErrorLogProvider')
  }
  return ctx
}
