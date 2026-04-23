import { useEffect, useState } from 'react'
import {
  defaultTheme,
  type ColorMode,
  loadThemeFromStorage,
  resolveColorMode,
  saveThemeToStorage,
  type VisualStyle,
} from '../lib/themeStorage'

function applyToDom(prefs: { colorMode: ColorMode; visualStyle: VisualStyle }) {
  const el = document.documentElement
  const resolved = resolveColorMode(
    prefs.colorMode,
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  el.setAttribute('data-color-mode', resolved)
  el.setAttribute('data-color-pref', prefs.colorMode)
  el.setAttribute('data-visual-style', prefs.visualStyle)
  saveThemeToStorage(prefs)
}

/**
 * Drives <html data-color-mode>, <code>data-color-pref</code>, <code>data-visual-style</code>
 * for the theme matrix. For <code>system</code>, follows <code>prefers-color-scheme</code>.
 */
export function useThemePreferences() {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    return loadThemeFromStorage().colorMode ?? defaultTheme.colorMode
  })
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(() => {
    return loadThemeFromStorage().visualStyle ?? defaultTheme.visualStyle
  })

  useEffect(() => {
    applyToDom({ colorMode, visualStyle })
  }, [colorMode, visualStyle])

  useEffect(() => {
    if (colorMode !== 'system') {
      return
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      applyToDom({ colorMode: 'system', visualStyle })
    }
    mq.addEventListener('change', onSystemChange)
    return () => mq.removeEventListener('change', onSystemChange)
  }, [colorMode, visualStyle])

  const resolvedColorMode: 'light' | 'dark' = resolveColorMode(
    colorMode,
    () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false),
  )

  return {
    colorMode,
    setColorMode,
    visualStyle,
    setVisualStyle,
    resolvedColorMode,
  }
}
