import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const apiProxyTarget = process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/token': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      '/token/refresh': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      '/logout': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      '/me': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      '/tasks': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      '/ws': {
        target: apiProxyTarget,
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
