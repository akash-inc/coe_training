import { ThemeProvider } from '@emotion/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApiErrorLogProvider } from './contexts/ApiErrorLogContext'
import { initTheme } from './lib/initTheme.ts'
import { queryClient } from './lib/queryClient.ts'
import { emotionTokenTheme } from './theme/emotionTokenTheme.ts'
import './index.css'
import App from './App.tsx'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiErrorLogProvider>
        <ThemeProvider theme={emotionTokenTheme}>
          <App />
        </ThemeProvider>
      </ApiErrorLogProvider>
    </QueryClientProvider>
  </StrictMode>,
)
