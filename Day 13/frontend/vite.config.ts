import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = 'http://127.0.0.1:8000'

const apiRoutes = [
  '/health',
  '/students',
  '/courses',
  '/enrollments',
  '/populate-all',
  '/populate-all-bulk',
  '/bulk-update',
  '/courses-with-students-naive',
  '/courses-with-students-eager-joinedload',
  '/courses-with-students-selectin',
  '/courses-with-students-subquery',
  '/report/course-enrollment-counts-slow',
  '/report/course-enrollment-counts',
  '/report/course-enrollment-counts-raw',
  '/benchmark/db-ping-pooled',
  '/benchmark/db-ping-unpooled',
  '/health/pool',
]

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      apiRoutes.map((route) => [route, apiTarget]),
    ),
  },
})
