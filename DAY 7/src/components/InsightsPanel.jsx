import { markRender } from './RenderCounter.js'
import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'

function InsightsPanel({ isImplementedProperly, onToggleStatus }) {
  markRender('InsightsPanel')

  let complexity = 0
  for (let i = 0; i < 100000; i += 1) {
    complexity += Math.sqrt((i % 43) + 1)
  }

  return (
    <section className="panel">
      <div className="exercise-header">
        <h3>Exercise 7 - Only load heavy UI when needed</h3>
        <ExerciseStatusToggle
          isImplementedProperly={isImplementedProperly}
          onToggleStatus={onToggleStatus}
        />
      </div>
      <p className="exercise-objective">
        Goal: this panel does a lot of work just to appear. If the user does
        not need it right away, we should load it later. Learn to use
        <code> React.lazy</code> + <code>Suspense</code> so this panel only
        loads when it is actually shown.
      </p>
      <p className="meta">
        Pretend-heavy number: {Math.round(complexity)} (this fake calculation
        simulates slow startup work).
      </p>
    </section>
  )
}

export default InsightsPanel
