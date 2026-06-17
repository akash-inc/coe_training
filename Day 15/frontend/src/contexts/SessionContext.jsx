import { createContext, useContext } from 'react'

export const SessionContext = createContext(null)

export function useOnSessionExpired() {
  return useContext(SessionContext)
}
