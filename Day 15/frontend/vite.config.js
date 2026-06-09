import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/token': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/token/refresh': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/me': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/tasks': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
