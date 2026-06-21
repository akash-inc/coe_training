import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    // PWA: precache the app shell + all built chunks for offline use, and
    // auto-register/auto-update the service worker. Runtime caching of feed
    // data is layered on in Commit 10.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'DevFeed',
        short_name: 'DevFeed',
        description: 'Hacker News, GitHub & RSS in one reader',
        theme_color: '#aa3bff',
        background_color: '#16171d',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'devfeed.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
        // SPA fallback: offline navigations to /article/... still resolve.
        navigateFallback: '/index.html',
      },
    }),
    // `npm run analyze` emits dist/stats.html — an interactive treemap of the
    // production bundle (Vite's equivalent of webpack-bundle-analyzer).
    process.env.ANALYZE &&
      visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        // Pin the two heavy parsers into their own cacheable vendor chunks.
        // They're already lazy (reachable only via the article route / RSS tab),
        // so this just makes them long-term-cacheable and obvious in the treemap.
        manualChunks(id) {
          if (id.includes('node_modules/marked')) return 'marked'
          if (id.includes('node_modules/fast-xml-parser')) return 'xml-parser'
        },
      },
    },
  },
})
