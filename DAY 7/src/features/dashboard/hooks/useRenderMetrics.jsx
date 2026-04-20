import { useEffect, useState } from 'react'
import { getRenderCounts, resetRenderCounts } from '../../../components/RenderCounter.js'

function useRenderMetrics() {
  const [renderSnapshot, setRenderSnapshot] = useState([])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRenderSnapshot(getRenderCounts())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const clearRenderMetrics = () => {
    resetRenderCounts()
    setRenderSnapshot(getRenderCounts())
  }

  return { renderSnapshot, clearRenderMetrics }
}

export default useRenderMetrics
