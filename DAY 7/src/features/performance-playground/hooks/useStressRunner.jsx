import { useCallback, useEffect, useState } from 'react'

function useStressRunner() {
  const [stressSignal, setStressSignal] = useState(0)
  const [isStressRunning, setIsStressRunning] = useState(false)

  const runStressTest = useCallback(() => {
    setStressSignal((value) => value + 1)
  }, [])

  const startStressTest = useCallback(() => {
    setIsStressRunning(true)
  }, [])

  const stopStressTest = useCallback(() => {
    setIsStressRunning(false)
  }, [])

  useEffect(() => {
    if (!isStressRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      setStressSignal((value) => value + 1)
    }, 1200)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isStressRunning])

  return {
    stressSignal,
    runStressTest,
    startStressTest,
    stopStressTest,
    isStressRunning,
  }
}

export default useStressRunner
