import { useMemo } from 'react'
import { expensiveStats } from './performanceData.js'
import { markRender } from './RenderCounter.js'
import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'

function StatsPanel({ items, isImplementedProperly, onToggleStatus }) {
  markRender('StatsPanel')
  const summary = useMemo(() => expensiveStats(items), [items])

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
          <dd>{summary.avgScore}</dd>
        </div>
      </dl>
    </section>
  )
}

export default StatsPanel
