import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'

function SearchPerformancePanel({
  query,
  onQueryChange,
  filteredItemsCount,
  isImplementedProperly,
  onToggleStatus,
}) {
  return (
    <section className="panel">
      <div className="exercise-header">
        <h3>Exercise 9 - Don&apos;t react to every single keystroke</h3>
        <ExerciseStatusToggle
          isImplementedProperly={isImplementedProperly}
          onToggleStatus={onToggleStatus}
        />
      </div>
      <p className="exercise-objective">
        Goal: when you type in the search box, the app filters 2400 rows on
        every letter. That is too much. Learn two tricks:
      </p>
      <ul className="exercise-objective">
        <li>
          <strong>Debounce</strong>: wait until the user stops typing for a
          moment, then run the filter once.
        </li>
        <li>
          <strong>Throttle</strong>: run the filter at most once every X
          milliseconds, no matter how fast the user types.
        </li>
      </ul>
      <input
        value={query}
        onChange={onQueryChange}
        placeholder="Type here to filter 2400 rows (it will feel laggy)"
      />
      <p className="meta">This is the search box used in Exercise 1 steps.</p>
      <p className="meta">Rows that match: {filteredItemsCount}</p>
    </section>
  )
}

export default SearchPerformancePanel
