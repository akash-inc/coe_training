import { useState } from 'react'
// Baseline: all panels are imported eagerly, so they share the main bundle.
// Commit 1 converts these to lazy chunks loaded only when the tab is active.
import HNPanel from '../panels/HNPanel'
import GitHubPanel from '../panels/GitHubPanel'
import RSSPanel from '../panels/RSSPanel'

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
        <ActivePanel />
      </section>
    </main>
  )
}
