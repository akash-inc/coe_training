import { getRenderCounts, markRender, resetRenderCounts } from './RenderCounter.js'
import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'

function RenderStatsPanel({ isImplementedProperly, onToggleStatus }) {
  markRender('RenderStatsPanel')
  const rows = getRenderCounts()

  return (
    <section className="panel">
      <div className="exercise-header">
        <h3>Exercise 2 - Find the slowest parts</h3>
        <ExerciseStatusToggle
          isImplementedProperly={isImplementedProperly}
          onToggleStatus={onToggleStatus}
        />
      </div>
      <p className="exercise-objective">
        Goal: figure out which components repaint (re-render) the most. Those
        are usually the ones worth fixing.
      </p>
      <p className="meta">
        The list below shows how many times each component has re-rendered
        since you opened the page. Higher number = more work.
      </p>
      <div className="list-box">
        {rows.map((row) => (
          <div className="list-row" key={row.component}>
            <span>{row.component}</span>
            <span>{row.count}</span>
          </div>
        ))}
      </div>
      <button type="button" onClick={resetRenderCounts}>
        Reset counts (start fresh)
      </button>
    </section>
  )
}

export default RenderStatsPanel
