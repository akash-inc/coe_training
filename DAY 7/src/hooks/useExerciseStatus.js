import { useCallback, useState } from 'react'

const INITIAL_EXERCISE_STATUS = {
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
}

function useExerciseStatus() {
  const [exerciseStatus, setExerciseStatus] = useState(INITIAL_EXERCISE_STATUS)

  const toggleExerciseStatus = useCallback((exerciseNumber) => {
    setExerciseStatus((previous) => ({
      ...previous,
      [exerciseNumber]: !previous[exerciseNumber],
    }))
  }, [])

  return { exerciseStatus, toggleExerciseStatus }
}

export default useExerciseStatus
