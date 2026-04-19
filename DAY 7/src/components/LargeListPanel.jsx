import { markRender } from './RenderCounter.js'
import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'

function LargeListPanel({ items, isImplementedProperly, onToggleStatus }) {
  markRender('LargeListPanel')

  return (
    <section className="panel">
      <div className="exercise-header">
        <h3>Exercise 8 - Only draw what the user can see</h3>
        <ExerciseStatusToggle
          isImplementedProperly={isImplementedProperly}
          onToggleStatus={onToggleStatus}
        />
      </div>
      <p className="exercise-objective">
        Goal: we have thousands of rows below. Drawing all of them is slow.
        Learn to use <code>react-window</code> so the browser only draws the
        rows that fit on the screen right now (and reuses them while you
        scroll).
      </p>
      <div className="list-box">
        {items.map((item) => (
          <div key={item.id} className="list-row">
            <span>{item.title}</span>
            <span>{item.category}</span>
            <span>{item.score}</span>
          </div>
        ))}
      </div>
      <p className="meta">
        Rows drawn right now: {items.length} (that is way too many)
      </p>
    </section>
  )
}

export default LargeListPanel
