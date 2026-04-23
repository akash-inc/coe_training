export const THEME_STORAGE_KEY = 'day9-theme'

export type ColorMode = 'light' | 'dark' | 'system'
export type VisualStyle = 'default' | 'colorful'

export type ThemePreferences = {
  colorMode: ColorMode
  visualStyle: VisualStyle
}

export const defaultTheme: ThemePreferences = {
  colorMode: 'system',
  visualStyle: 'default',
}

export function loadThemeFromStorage(): ThemePreferences {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return { ...defaultTheme }
    const p = JSON.parse(raw) as Partial<ThemePreferences>
    return {
      colorMode: p.colorMode ?? defaultTheme.colorMode,
      visualStyle: p.visualStyle ?? defaultTheme.visualStyle,
    }
  } catch {
    return { ...defaultTheme }
  }
}

export function saveThemeToStorage(t: ThemePreferences) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(t))
}

export function resolveColorMode(
  colorMode: ColorMode,
  prefersDark: () => boolean,
): 'light' | 'dark' {
  if (colorMode === 'system') {
    return prefersDark() ? 'dark' : 'light'
  }
  return colorMode
}
