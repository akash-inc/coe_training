/* eslint-disable react-refresh/only-export-components -- router config module, not a component file */
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

// Route-based code splitting: each page is its own chunk, fetched on navigation.
// The article chunk carries `marked`, so it's never downloaded until you open
// an article — keeping the feed entry bundle lean.
const FeedPage = lazy(() => import('./pages/FeedPage'))
const ArticlePage = lazy(() => import('./pages/ArticlePage'))

const withSuspense = (element) => (
  <Suspense fallback={<p className="feed-status">Loading…</p>}>{element}</Suspense>
)

export const router = createBrowserRouter([
  { path: '/', element: withSuspense(<FeedPage />) },
  { path: '/article/:source/:id', element: withSuspense(<ArticlePage />) },
])
