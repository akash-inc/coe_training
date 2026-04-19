import { useState } from 'react'
import ActionPanel from './ActionPanel.jsx'
import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'
import InsightsPanel from './InsightsPanel.jsx'
import LargeListPanel from './LargeListPanel.jsx'
import ProfilerChecklist from './ProfilerChecklist.jsx'
import RenderStatsPanel from './RenderStatsPanel.jsx'
import StatsPanel from './StatsPanel.jsx'
import { buildItems, expensiveFilter } from './performanceData.js'

const ALL_ITEMS = buildItems(2400)

function ExercisePlayground() {
  const [query, setQuery] = useState('')
  const [count, setCount] = useState(0)
  const [showDetails, setShowDetails] = useState(true)
  const [exerciseStatus, setExerciseStatus] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
  })

  const toggleExerciseStatus = (exerciseNumber) => {
    setExerciseStatus((previous) => ({
      ...previous,
      [exerciseNumber]: !previous[exerciseNumber],
    }))
  }

  const filteredItems = expensiveFilter(ALL_ITEMS, query)

  return (
    <div className="playground-grid">
      <ProfilerChecklist
        isImplementedProperly={exerciseStatus[1]}
        onToggleStatus={() => toggleExerciseStatus(1)}
      />

      <section className="panel">
        <div className="exercise-header">
          <h3>Exercise status guide</h3>
        </div>
        <p className="exercise-objective">
          Each exercise has its own red/green toggle now:
        </p>
        <ul className="exercise-objective">
          <li>
            <strong>Red</strong> = not fixed yet.
          </li>
          <li>
            <strong>Green</strong> = fixed and implemented properly.
          </li>
        </ul>
      </section>

      <section className="panel">
        <div className="exercise-header">
          <h3>Exercise 9 - Don&apos;t react to every single keystroke</h3>
          <ExerciseStatusToggle
            isImplementedProperly={exerciseStatus[9]}
            onToggleStatus={() => toggleExerciseStatus(9)}
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
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type here to filter 2400 rows (it will feel laggy)"
        />
        <p className="meta">This is the search box used in Exercise 1 steps.</p>
        <p className="meta">Rows that match: {filteredItems.length}</p>
      </section>

      <ActionPanel
        count={count}
        onIncrement={() => setCount((value) => value + 1)}
        onToggle={() => setShowDetails((value) => !value)}
        showDetails={showDetails}
        exercise3Done={exerciseStatus[3]}
        exercise5Done={exerciseStatus[5]}
        onToggleExercise3={() => toggleExerciseStatus(3)}
        onToggleExercise5={() => toggleExerciseStatus(5)}
      />

      <StatsPanel
        items={filteredItems}
        isImplementedProperly={exerciseStatus[4]}
        onToggleStatus={() => toggleExerciseStatus(4)}
      />

      <section className="panel">
        <div className="exercise-header">
          <h3>Exercise 6 - Lazy-load the Playground route</h3>
          <ExerciseStatusToggle
            isImplementedProperly={exerciseStatus[6]}
            onToggleStatus={() => toggleExerciseStatus(6)}
          />
        </div>
        <p className="exercise-objective">
          Goal: do not load Playground code at app start. Load it only when the
          user opens <code>/playground</code>.
        </p>
      </section>

      {showDetails ? (
        <InsightsPanel
          isImplementedProperly={exerciseStatus[7]}
          onToggleStatus={() => toggleExerciseStatus(7)}
        />
      ) : null}

      <LargeListPanel
        items={filteredItems}
        isImplementedProperly={exerciseStatus[8]}
        onToggleStatus={() => toggleExerciseStatus(8)}
      />

      <section className="panel">
        <div className="exercise-header">
          <h3>Exercise 10 - Move heavy work to a Web Worker</h3>
          <ExerciseStatusToggle
            isImplementedProperly={exerciseStatus[10]}
            onToggleStatus={() => toggleExerciseStatus(10)}
          />
        </div>
        <p className="exercise-objective">
          Goal: move expensive calculations to a worker so typing and clicking
          stay smooth on the main page.
        </p>
      </section>

      <RenderStatsPanel
        isImplementedProperly={exerciseStatus[2]}
        onToggleStatus={() => toggleExerciseStatus(2)}
      />
    </div>
  )
}

export default ExercisePlayground
