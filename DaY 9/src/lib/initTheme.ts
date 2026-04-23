import { defaultTheme, loadThemeFromStorage, resolveColorMode } from './themeStorage'

/**
 * Synchronous: apply saved theme to <html> before first paint to reduce theme flash.
 */
export function initTheme() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return
  }
  const t = loadThemeFromStorage()
  const resolved = resolveColorMode(
    t.colorMode,
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const el = document.documentElement
  el.setAttribute('data-color-mode', resolved)
  el.setAttribute('data-color-pref', t.colorMode)
  el.setAttribute('data-visual-style', t.visualStyle ?? defaultTheme.visualStyle)
}
