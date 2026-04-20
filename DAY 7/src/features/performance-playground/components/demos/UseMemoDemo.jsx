import { useEffect, useMemo, useState } from 'react'
import ComparisonPanel from '../ComparisonPanel.jsx'
import { computeHeavyStats } from '../../utils/heavyCalcs.js'
import { buildNumberSet } from '../../utils/mockData.js'

function UnoptimizedCalcPane({ numbers, intensity, uiTick, onMeasure }) {
  const result = useMemo(
    () => {
      // uiTick intentionally forces recomputation for unoptimized comparison.
      void uiTick
      return computeHeavyStats(numbers, intensity)
    },
    [numbers, intensity, uiTick],
  )

  useEffect(() => {
    onMeasure(result.durationMs)
  }, [onMeasure, result.durationMs])

  return (
    <div className="mini-card" style={{ background: uiTick % 2 ? '#fff6f6' : undefined }}>
      <p className="meta">Unrelated state tick: {uiTick}</p>
      <p className="meta">Average: {result.average}</p>
      <p className="meta">Compute time: {result.durationMs}ms</p>
      <p className="meta">Recomputed each unrelated update: Yes</p>
    </div>
  )
}

function OptimizedCalcPane({ numbers, intensity, uiTick, onMeasure }) {
  const result = useMemo(
    () => computeHeavyStats(numbers, intensity),
    [numbers, intensity],
  )

  useEffect(() => {
    onMeasure(result.durationMs)
  }, [onMeasure, result.durationMs])

  return (
    <div className="mini-card" style={{ background: uiTick % 2 ? '#f4fff6' : undefined }}>
      <p className="meta">Unrelated state tick: {uiTick}</p>
      <p className="meta">Average: {result.average}</p>
      <p className="meta">Compute time: {result.durationMs}ms</p>
      <p className="meta">Recomputed each unrelated update: No</p>
    </div>
  )
}

function UseMemoDemo({ stressSignal, onMetrics, cpuThrottleEnabled }) {
  const numbers = useMemo(() => buildNumberSet(10000), [])
  const [uiTick, setUiTick] = useState(0)
  const [unoptimizedDurationMs, setUnoptimizedDurationMs] = useState(0)
  const [optimizedDurationMs, setOptimizedDurationMs] = useState(0)

  useEffect(() => {
    if (stressSignal > 0) {
      const timerId = window.setTimeout(() => {
        setUiTick((value) => value + 1)
      }, 0)
      return () => {
        window.clearTimeout(timerId)
      }
    }
    return undefined
  }, [stressSignal])

  const intensity = cpuThrottleEnabled ? 3.5 : 2.2

  const badStats = useMemo(
    () => ({
      renders: uiTick + 1,
      timeMs: unoptimizedDurationMs,
    }),
    [uiTick, unoptimizedDurationMs],
  )
  const goodStats = useMemo(
    () => ({
      renders: uiTick + 1,
      timeMs: optimizedDurationMs,
    }),
    [uiTick, optimizedDurationMs],
  )

  useEffect(() => {
    onMetrics('use-memo', 'unoptimized', badStats)
    onMetrics('use-memo', 'optimized', goodStats)
  }, [badStats, goodStats, onMetrics])

  return (
    <ComparisonPanel
      title="2) useMemo Demo"
      description="Unrelated UI changes should not re-run expensive calculations."
      badStats={badStats}
      goodStats={goodStats}
      badPane={
        <div>
          <UnoptimizedCalcPane
            numbers={numbers}
            intensity={intensity}
            uiTick={uiTick}
            onMeasure={setUnoptimizedDurationMs}
          />
          <button type="button" onClick={() => setUiTick((value) => value + 1)}>
            Change unrelated state
          </button>
        </div>
      }
      goodPane={
        <div>
          <OptimizedCalcPane
            numbers={numbers}
            intensity={intensity}
            uiTick={uiTick}
            onMeasure={setOptimizedDurationMs}
          />
          <button type="button" onClick={() => setUiTick((value) => value + 1)}>
            Change unrelated state
          </button>
        </div>
      }
    />
  )
}

export default UseMemoDemo
