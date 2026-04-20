import { Suspense, lazy, useState } from 'react'

const ChartsPanel = lazy(() => import('./analytics/ChartsPanel.jsx'))
const ReportsPanel = lazy(() => import('./analytics/ReportsPanel.jsx'))
const StatisticsPanel = lazy(() => import('./analytics/StatisticsPanel.jsx'))

function AnalyticsSection({ products }) {
  const [activePanel, setActivePanel] = useState('charts')

  return (
    <section className="panel dashboard-panel">
      <h3>Analytics Section (Lazy Loaded)</h3>
      <div className="button-row">
        <button type="button" onClick={() => setActivePanel('charts')}>
          Charts
        </button>
        <button type="button" onClick={() => setActivePanel('reports')}>
          Reports
        </button>
        <button type="button" onClick={() => setActivePanel('statistics')}>
          Statistics
        </button>
      </div>
      <Suspense fallback={<p className="meta">Loading analytics module...</p>}>
        {activePanel === 'charts' ? <ChartsPanel products={products} /> : null}
        {activePanel === 'reports' ? <ReportsPanel products={products} /> : null}
        {activePanel === 'statistics' ? (
          <StatisticsPanel products={products} />
        ) : null}
      </Suspense>
    </section>
  )
}

export default AnalyticsSection
