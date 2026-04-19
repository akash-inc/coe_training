import { useCallback } from 'react'
import ActionPanel from './ActionPanel.jsx'
import ExerciseInfoPanel from './ExerciseInfoPanel.jsx'
import ExerciseStatusGuidePanel from './ExerciseStatusGuidePanel.jsx'
import InsightsPanel from './InsightsPanel.jsx'
import LargeListPanel from './LargeListPanel.jsx'
import ProfilerChecklist from './ProfilerChecklist.jsx'
import RenderStatsPanel from './RenderStatsPanel.jsx'
import SearchPerformancePanel from './SearchPerformancePanel.jsx'
import StatsPanel from './StatsPanel.jsx'
import useExerciseStatus from '../hooks/useExerciseStatus.js'
import usePlaygroundState from '../hooks/usePlaygroundState.js'

function ExercisePlayground() {
  const {
    query,
    count,
    showDetails,
    filteredItems,
    handleQueryChange,
    incrementCount,
    toggleDetails,
  } = usePlaygroundState()
  const { exerciseStatus, toggleExerciseStatus } = useExerciseStatus()
  const toggleExercise1 = useCallback(
    () => toggleExerciseStatus(1),
    [toggleExerciseStatus],
  )
  const toggleExercise2 = useCallback(
    () => toggleExerciseStatus(2),
    [toggleExerciseStatus],
  )
  const toggleExercise3 = useCallback(
    () => toggleExerciseStatus(3),
    [toggleExerciseStatus],
  )
  const toggleExercise4 = useCallback(
    () => toggleExerciseStatus(4),
    [toggleExerciseStatus],
  )
  const toggleExercise5 = useCallback(
    () => toggleExerciseStatus(5),
    [toggleExerciseStatus],
  )
  const toggleExercise6 = useCallback(
    () => toggleExerciseStatus(6),
    [toggleExerciseStatus],
  )
  const toggleExercise7 = useCallback(
    () => toggleExerciseStatus(7),
    [toggleExerciseStatus],
  )
  const toggleExercise8 = useCallback(
    () => toggleExerciseStatus(8),
    [toggleExerciseStatus],
  )
  const toggleExercise9 = useCallback(
    () => toggleExerciseStatus(9),
    [toggleExerciseStatus],
  )
  const toggleExercise10 = useCallback(
    () => toggleExerciseStatus(10),
    [toggleExerciseStatus],
  )

  return (
    <div className="playground-grid">
      <ProfilerChecklist
        isImplementedProperly={exerciseStatus[1]}
        onToggleStatus={toggleExercise1}
      />

      <ExerciseStatusGuidePanel />

      <SearchPerformancePanel
        query={query}
        onQueryChange={handleQueryChange}
        filteredItemsCount={filteredItems.length}
        isImplementedProperly={exerciseStatus[9]}
        onToggleStatus={toggleExercise9}
      />

      <ActionPanel
        count={count}
        onIncrement={incrementCount}
        onToggle={toggleDetails}
        showDetails={showDetails}
        exercise3Done={exerciseStatus[3]}
        exercise5Done={exerciseStatus[5]}
        onToggleExercise3={toggleExercise3}
        onToggleExercise5={toggleExercise5}
      />

      <StatsPanel
        items={filteredItems}
        isImplementedProperly={exerciseStatus[4]}
        onToggleStatus={toggleExercise4}
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
        onToggleStatus={toggleExercise6}
      />

      {showDetails ? (
        <InsightsPanel
          isImplementedProperly={exerciseStatus[7]}
          onToggleStatus={toggleExercise7}
        />
      ) : null}

      <LargeListPanel
        items={filteredItems}
        isImplementedProperly={exerciseStatus[8]}
        onToggleStatus={toggleExercise8}
      />

      <ExerciseInfoPanel
        title="Exercise 10 - Move heavy work to a Web Worker"
        description="Goal: move expensive calculations to a worker so typing and clicking stay smooth on the main page."
        isImplementedProperly={exerciseStatus[10]}
        onToggleStatus={toggleExercise10}
      />

      <RenderStatsPanel
        isImplementedProperly={exerciseStatus[2]}
        onToggleStatus={toggleExercise2}
      />
    </div>
  )
}

export default ExercisePlayground
