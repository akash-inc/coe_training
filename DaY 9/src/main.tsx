import { ThemeProvider } from '@emotion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTheme } from './lib/initTheme'
import { emotionTokenTheme } from './theme/emotionTokenTheme'
import './index.css'
import App from './App.tsx'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={emotionTokenTheme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
