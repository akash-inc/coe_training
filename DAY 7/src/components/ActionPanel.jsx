import { markRender } from './RenderCounter.js'
import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'

function ActionPanel({
  count,
  onIncrement,
  onToggle,
  showDetails,
  exercise3Done,
  exercise5Done,
  onToggleExercise3,
  onToggleExercise5,
}) {
  markRender('ActionPanel')

  return (
    <section className="panel">
      <div className="exercise-header">
        <h3>Exercise 3 and 5 - Stop repeated re-renders</h3>
      </div>
      <div className="button-row">
        <span className="meta">Exercise 3 status:</span>
        <ExerciseStatusToggle
          isImplementedProperly={exercise3Done}
          onToggleStatus={onToggleExercise3}
        />
        <span className="meta">Exercise 5 status:</span>
        <ExerciseStatusToggle
          isImplementedProperly={exercise5Done}
          onToggleStatus={onToggleExercise5}
        />
      </div>
      <p className="exercise-objective">
        Goal: learn two React tools that stop unnecessary re-renders:
      </p>
      <ul className="exercise-objective">
        <li>
          <code>React.memo</code> - tell React: &quot;if the inputs did not
          change, do not redraw this component&quot;.
        </li>
        <li>
          <code>useCallback</code> - tell React: &quot;remember this function;
          do not make a new one on every render&quot;.
        </li>
      </ul>
      <div className="button-row">
        <button type="button" onClick={onIncrement}>
          Add 1 to counter ({count})
        </button>
        <button type="button" onClick={onToggle}>
          {showDetails ? 'Hide' : 'Show'} details panel
        </button>
      </div>
      <p className="meta">
        Right now this panel redraws too often. Click the buttons and watch the
        &quot;ActionPanel&quot; count grow in Exercise 2&apos;s list.
      </p>
    </section>
  )
}

export default ActionPanel
