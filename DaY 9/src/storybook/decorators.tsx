import { ThemeProvider } from '@emotion/react'
import type { Decorator } from '@storybook/react-vite'
import { emotionTokenTheme } from '../theme/emotionTokenTheme'
import { DocumentThemeSync } from './DocumentThemeSync'

export const withAppEnvironment: Decorator = (Story) => (
  <ThemeProvider theme={emotionTokenTheme}>
    <DocumentThemeSync>
      <div className="bg-background p-4 text-foreground">
        <Story />
      </div>
    </DocumentThemeSync>
  </ThemeProvider>
)
