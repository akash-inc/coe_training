export const emotionTokenTheme = {
  fg: 'var(--fg)',
  mutedFg: 'var(--muted-fg)',
  bg: 'var(--bg)',
  cardBg: 'var(--card-bg)',
  border: 'var(--border)',
  codeBg: 'var(--code-bg)',
  shadow: 'var(--shadow)',
  accent: 'var(--accent)',
  accentBg: 'var(--accent-bg)',
  accentBorder: 'var(--accent-border)',
} as const

export type EmotionTokenTheme = typeof emotionTokenTheme
