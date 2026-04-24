import { ThemeProvider } from '@emotion/react'
import type { Decorator } from '@storybook/react-vite'
import { emotionTokenTheme } from '../theme/emotionTokenTheme'
import { DocumentThemeSync } from './DocumentThemeSync'
import { StoryQueryProvider } from './StoryQueryProvider'

export const withAppEnvironment: Decorator = (Story) => (
  <StoryQueryProvider>
    <ThemeProvider theme={emotionTokenTheme}>
      <DocumentThemeSync>
        <div className="bg-background p-4 text-foreground">
          <Story />
        </div>
      </DocumentThemeSync>
    </ThemeProvider>
  </StoryQueryProvider>
)
