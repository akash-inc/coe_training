import { useState } from 'react'
import ActionPanel from './ActionPanel.jsx'
import ExerciseInfoPanel from './ExerciseInfoPanel.jsx'
import ExerciseStatusGuidePanel from './ExerciseStatusGuidePanel.jsx'
import InsightsPanel from './InsightsPanel.jsx'
import LargeListPanel from './LargeListPanel.jsx'
import ProfilerChecklist from './ProfilerChecklist.jsx'
import RenderStatsPanel from './RenderStatsPanel.jsx'
import SearchPerformancePanel from './SearchPerformancePanel.jsx'
import StatsPanel from './StatsPanel.jsx'
import { buildItems, expensiveFilter } from './performanceData.js'
import useExerciseStatus from '../hooks/useExerciseStatus.js'

const ALL_ITEMS = buildItems(2400)

function ExercisePlayground() {
  const [query, setQuery] = useState('')
  const [count, setCount] = useState(0)
  const [showDetails, setShowDetails] = useState(true)
  const { exerciseStatus, toggleExerciseStatus } = useExerciseStatus()

  const filteredItems = expensiveFilter(ALL_ITEMS, query)

  return (
    <div className="playground-grid">
      <ProfilerChecklist
        isImplementedProperly={exerciseStatus[1]}
        onToggleStatus={() => toggleExerciseStatus(1)}
      />

      <ExerciseStatusGuidePanel />

      <SearchPerformancePanel
        query={query}
        onQueryChange={(event) => setQuery(event.target.value)}
        filteredItemsCount={filteredItems.length}
        isImplementedProperly={exerciseStatus[9]}
        onToggleStatus={() => toggleExerciseStatus(9)}
      />

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

      <ExerciseInfoPanel
        title="Exercise 6 - Lazy-load the Playground route"
        description={
          <>
            Goal: do not load Playground code at app start. Load it only when
            the user opens <code>/playground</code>.
          </>
        }
        isImplementedProperly={exerciseStatus[6]}
        onToggleStatus={() => toggleExerciseStatus(6)}
      />

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

      <ExerciseInfoPanel
        title="Exercise 10 - Move heavy work to a Web Worker"
        description="Goal: move expensive calculations to a worker so typing and clicking stay smooth on the main page."
        isImplementedProperly={exerciseStatus[10]}
        onToggleStatus={() => toggleExerciseStatus(10)}
      />

      <RenderStatsPanel
        isImplementedProperly={exerciseStatus[2]}
        onToggleStatus={() => toggleExerciseStatus(2)}
      />
    </div>
  )
}

export default ExercisePlayground
