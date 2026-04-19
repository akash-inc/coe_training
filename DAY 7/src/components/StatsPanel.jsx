import { useEffect, useMemo, useRef, useState } from 'react'
import { markRender } from './RenderCounter.js'
import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'

function StatsPanel({ items, isImplementedProperly, onToggleStatus }) {
  markRender('StatsPanel')
  const [workerAverageScore, setWorkerAverageScore] = useState(0)
  const workerRef = useRef(null)
  const activeRequestIdRef = useRef(0)

  const summary = useMemo(() => {
    let hotCount = 0
    let coldCount = 0

    for (const item of items) {
      if (item.category === 'hot') {
        hotCount += 1
      } else {
        coldCount += 1
      }
    }

    return { hotCount, coldCount }
  }, [items])

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/analysis.worker.js', import.meta.url),
      { type: 'module' },
    )

    const worker = workerRef.current
    worker.onmessage = (event) => {
      const { requestId, averageScore } = event.data
      if (requestId === activeRequestIdRef.current) {
        setWorkerAverageScore(averageScore)
      }
    }

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!workerRef.current) {
      return
    }

    activeRequestIdRef.current += 1
    workerRef.current.postMessage({
      requestId: activeRequestIdRef.current,
      items,
    })
  }, [items])

  return (
    <section className="panel">
      <div className="exercise-header">
        <h3>Exercise 4 - Don&apos;t repeat heavy math</h3>
        <ExerciseStatusToggle
          isImplementedProperly={isImplementedProperly}
          onToggleStatus={onToggleStatus}
        />
      </div>
      <p className="exercise-objective">
        Goal: some numbers below take a long time to calculate. Right now we
        recalculate them on every render, even if nothing changed. Use
        <code> useMemo</code> to only recalculate when the data actually
        changes.
      </p>
      <dl className="stats-grid">
        <div>
          <dt>Hot rows</dt>
          <dd>{summary.hotCount}</dd>
        </div>
        <div>
          <dt>Cold rows</dt>
          <dd>{summary.coldCount}</dd>
        </div>
        <div>
          <dt>Average score</dt>
          <dd>{workerAverageScore}</dd>
        </div>
      </dl>
    </section>
  )
}

export default StatsPanel
