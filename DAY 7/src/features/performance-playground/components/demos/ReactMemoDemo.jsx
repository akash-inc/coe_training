import { memo, useEffect, useMemo, useState } from 'react'
import ComparisonPanel from '../ComparisonPanel.jsx'
import useRenderTracker from '../../hooks/useRenderTracker.jsx'

function StaticChild({ label, highlightRenders }) {
  const { renderCount, flashClass } = useRenderTracker()

  return (
    <div className={`mini-card ${highlightRenders ? flashClass : ''}`}>
      <strong>{label}</strong>
      <p className="meta">Render count: {renderCount}</p>
    </div>
  )
}

const MemoStaticChild = memo(StaticChild)

function ReactMemoDemo({ stressSignal, onMetrics, highlightRenders }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTick((value) => value + 1)
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (stressSignal > 0) {
      const timerId = window.setTimeout(() => {
        setTick((value) => value + 3)
      }, 0)
      return () => {
        window.clearTimeout(timerId)
      }
    }
    return undefined
  }, [stressSignal])

  const badStats = useMemo(
    () => ({ renders: tick + 1, timeMs: 8 }),
    [tick],
  )
  const goodStats = useMemo(
    () => ({ renders: 1, timeMs: 1 }),
    [],
  )

  useEffect(() => {
    onMetrics('react-memo', 'unoptimized', badStats)
    onMetrics('react-memo', 'optimized', goodStats)
  }, [badStats, goodStats, onMetrics])

  return (
    <ComparisonPanel
      title="1) React.memo Demo"
      description="Parent updates every second while child props stay static."
      badStats={badStats}
      goodStats={goodStats}
      badPane={
        <div>
          <p className="meta">Parent tick: {tick}</p>
          <StaticChild
            label="Normal child (rerenders often)"
            highlightRenders={highlightRenders}
          />
        </div>
      }
      goodPane={
        <div>
          <p className="meta">Parent tick: {tick}</p>
          <MemoStaticChild
            label="Memoized child (stable)"
            highlightRenders={highlightRenders}
          />
        </div>
      }
    />
  )
}

export default ReactMemoDemo
