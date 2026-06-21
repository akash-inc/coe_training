import { lazy, Suspense, useState } from 'react'

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
        {/* Suspense covers the chunk download for the active panel. */}
        <Suspense fallback={<p className="feed-status">Loading panel…</p>}>
          <ActivePanel />
        </Suspense>
      </section>
    </main>
  )
}
