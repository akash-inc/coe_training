import { useEffect, type ReactNode } from 'react'

export function DocumentThemeSync({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    if (!root.getAttribute('data-color-mode')) {
      root.setAttribute('data-color-mode', 'light')
    }
    if (!root.getAttribute('data-color-pref')) {
      root.setAttribute('data-color-pref', 'system')
    }
    if (!root.getAttribute('data-visual-style')) {
      root.setAttribute('data-visual-style', 'default')
    }
  }, [])
  return <>{children}</>
}
