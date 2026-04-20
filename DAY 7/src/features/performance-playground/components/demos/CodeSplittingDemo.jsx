import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import ComparisonPanel from '../ComparisonPanel.jsx'
import HeavyAnalyticsModule from './lazy/HeavyAnalyticsModule.jsx'

const LazyHeavyAnalyticsModule = lazy(
  () => import('./lazy/LazyAnalyticsModule.jsx'),
)

function CodeSplittingDemo({ stressSignal, onMetrics }) {
  const [loadOptimized, setLoadOptimized] = useState(false)
  const [optimizedLoadMs, setOptimizedLoadMs] = useState(0)
  const [loadStartedAt, setLoadStartedAt] = useState(null)

  useEffect(() => {
    if (stressSignal > 0) {
      const timerId = window.setTimeout(() => {
        setLoadOptimized(true)
        setLoadStartedAt(performance.now())
      }, 0)
      return () => {
        window.clearTimeout(timerId)
      }
    }
    return undefined
  }, [stressSignal])

  const badStats = useMemo(
    () => ({ renders: 1, timeMs: 120 }),
    [],
  )
  const goodStats = useMemo(
    () => ({ renders: loadOptimized ? 2 : 1, timeMs: loadOptimized ? 40 : 8 }),
    [loadOptimized],
  )

  useEffect(() => {
    onMetrics('code-splitting', 'unoptimized', badStats)
    onMetrics('code-splitting', 'optimized', goodStats)
  }, [badStats, goodStats, onMetrics])

  const onLoadOptimized = useCallback(() => {
    if (loadStartedAt !== null) {
      setOptimizedLoadMs(Number((performance.now() - loadStartedAt).toFixed(2)))
    }
  }, [loadStartedAt])

  return (
    <ComparisonPanel
      title="6) Code Splitting Demo"
      description="Heavy module loaded up-front vs lazily loaded on demand."
      badStats={badStats}
      goodStats={goodStats}
      badPane={
        <div>
          <p className="meta">Initial bundle: 500KB (simulated)</p>
          <HeavyAnalyticsModule title="Eager analytics module" />
        </div>
      }
      goodPane={
        <div>
          <p className="meta">Initial bundle: 50KB (simulated)</p>
          {!loadOptimized ? (
            <button
              type="button"
              onClick={() => {
                setLoadStartedAt(performance.now())
                setLoadOptimized(true)
              }}
            >
              Load Dashboard
            </button>
          ) : null}
          {loadOptimized ? (
            <Suspense fallback={<p className="meta">Loading chunk...</p>}>
              <LazyHeavyAnalyticsModule
                title="Lazy analytics module"
                onReady={onLoadOptimized}
              />
            </Suspense>
          ) : null}
          <p className="meta">Lazy chunk: 450KB (simulated)</p>
          <p className="meta">
            Load time: {optimizedLoadMs > 0 ? `${optimizedLoadMs}ms` : '-'}
          </p>
        </div>
      }
    />
  )
}

export default CodeSplittingDemo
