import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
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
