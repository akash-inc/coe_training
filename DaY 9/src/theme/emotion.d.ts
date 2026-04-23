import '@emotion/react'
import type { EmotionTokenTheme } from './emotionTokenTheme'

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Emotion `Theme` merge
  export interface Theme extends EmotionTokenTheme {}
}
