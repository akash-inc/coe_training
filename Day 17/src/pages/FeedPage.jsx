import { lazy, Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import FeedErrorFallback from '../components/FeedErrorFallback'
import SkeletonList from '../components/SkeletonCard'

// Each panel is a separate dynamic import, so Vite emits one chunk per source.
// The chunk is only fetched when its tab is first activated (deferred loading) —
// open the Network tab and watch GitHubPanel-*.js arrive only when you click GitHub.
const HNPanel = lazy(() => import('../panels/HNPanel'))
const GitHubPanel = lazy(() => import('../panels/GitHubPanel'))
const RSSPanel = lazy(() => import('../panels/RSSPanel'))

const TABS = [
  { id: 'hn', label: 'Hacker News', Panel: HNPanel },
  { id: 'github', label: 'GitHub', Panel: GitHubPanel },
  { id: 'rss', label: 'RSS', Panel: RSSPanel },
]

export default function FeedPage() {
  const [active, setActive] = useState('hn')
  const ActivePanel = TABS.find((t) => t.id === active).Panel

  return (
    <main className="feed">
      <header className="feed-header">
        <h1>DevFeed</h1>
        <p className="feed-tagline">Hacker News · GitHub · RSS, in one place.</p>
      </header>

      <nav className="tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            className={`tab ${active === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="panel">
        {/* Each panel gets its own boundary keyed by tab, so a failure in one
            source never takes down the others. QueryErrorResetBoundary wires
            Retry to re-run the failed query. */}
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              resetKeys={[active]}
              FallbackComponent={FeedErrorFallback}
            >
              {/* Covers both the lazy chunk download and the suspense query —
                  skeleton cards stand in until the feed is ready. */}
              <Suspense fallback={<SkeletonList />}>
                <ActivePanel />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </section>
    </main>
  )
}
