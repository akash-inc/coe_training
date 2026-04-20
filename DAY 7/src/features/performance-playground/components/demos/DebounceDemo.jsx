import { useEffect, useMemo, useRef, useState } from 'react'
import ComparisonPanel from '../ComparisonPanel.jsx'

function DebounceDemo({ stressSignal, onMetrics }) {
  const [leftQuery, setLeftQuery] = useState('')
  const [rightQuery, setRightQuery] = useState('')
  const [leftCalls, setLeftCalls] = useState(0)
  const [rightCalls, setRightCalls] = useState(0)
  const [leftLoading, setLeftLoading] = useState(false)
  const [rightLoading, setRightLoading] = useState(false)
  const [rightLastDebounceMs, setRightLastDebounceMs] = useState(0)
  const rightRequestTimeoutRef = useRef(null)

  useEffect(() => {
    if (leftQuery.length === 0) {
      return
    }
    const loadingId = window.setTimeout(() => {
      setLeftLoading(true)
    }, 0)
    const requestId = window.setTimeout(() => {
      setLeftCalls((value) => value + 1)
      setLeftLoading(false)
    }, 100)
    return () => {
      window.clearTimeout(loadingId)
      window.clearTimeout(requestId)
    }
  }, [leftQuery])

  useEffect(() => {
    if (rightQuery.length === 0) {
      const idleId = window.setTimeout(() => {
        setRightLoading(false)
      }, 0)
      return () => {
        window.clearTimeout(idleId)
      }
    }

    const startedAt = performance.now()
    const debounceId = window.setTimeout(() => {
      setRightLoading(true)
      const requestId = window.setTimeout(() => {
        setRightCalls((value) => value + 1)
        setRightLoading(false)
        setRightLastDebounceMs(
          Number((performance.now() - startedAt).toFixed(2)),
        )
      }, 100)
      rightRequestTimeoutRef.current = requestId
    }, 300)

    return () => {
      window.clearTimeout(debounceId)
      if (rightRequestTimeoutRef.current) {
        window.clearTimeout(rightRequestTimeoutRef.current)
        rightRequestTimeoutRef.current = null
      }
    }
  }, [rightQuery])

  useEffect(() => {
    if (stressSignal > 0) {
      const timerId = window.setTimeout(() => {
        setLeftQuery((value) => `${value}abc`.slice(-12))
        setRightQuery((value) => `${value}abc`.slice(-12))
      }, 0)
      return () => {
        window.clearTimeout(timerId)
      }
    }
    return undefined
  }, [stressSignal])

  const badStats = useMemo(
    () => ({ renders: leftCalls + leftQuery.length, timeMs: leftLoading ? 80 : 20 }),
    [leftCalls, leftLoading, leftQuery.length],
  )
  const goodStats = useMemo(
    () => ({
      renders: rightCalls + rightQuery.length,
      timeMs: rightLoading ? 30 : 8,
    }),
    [rightCalls, rightLoading, rightQuery.length],
  )

  useEffect(() => {
    onMetrics('debounce', 'unoptimized', badStats)
    onMetrics('debounce', 'optimized', goodStats)
  }, [badStats, goodStats, onMetrics])

  return (
    <ComparisonPanel
      title="5) Debounce Demo"
      description="Simulated API requests on each keypress vs debounced request dispatch."
      badStats={badStats}
      goodStats={goodStats}
      badPane={
        <div>
          <input
            value={leftQuery}
            onChange={(event) => setLeftQuery(event.target.value)}
            placeholder="Type smartphone..."
          />
          <p className="meta">API calls: {leftCalls}</p>
          <p className="meta">{leftLoading ? 'Loading...' : 'Idle'}</p>
        </div>
      }
      goodPane={
        <div>
          <input
            value={rightQuery}
            onChange={(event) => setRightQuery(event.target.value)}
            placeholder="Type smartphone..."
          />
          <p className="meta">API calls: {rightCalls}</p>
          <p className="meta">{rightLoading ? 'Loading...' : 'Idle'}</p>
          <p className="meta">
            Last debounce+request delay: {rightLastDebounceMs || '-'}ms
          </p>
        </div>
      }
    />
  )
}

export default DebounceDemo
