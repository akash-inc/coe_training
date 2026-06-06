import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/users': apiTarget,
      '/tasks': apiTarget,
      '/token': apiTarget,
      '/me': apiTarget,
      '/dashboard': {
        target: apiTarget,
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html'
          }
        },
      },
      '/health': apiTarget,
      '/logout': apiTarget,
      '/token/refresh': apiTarget,
    },
  },
})
