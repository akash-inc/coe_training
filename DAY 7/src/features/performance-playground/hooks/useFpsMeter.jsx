import { useEffect, useState } from 'react'

function useFpsMeter() {
  const [fps, setFps] = useState(60)

  useEffect(() => {
    let frameCount = 0
    let lastTimestamp = performance.now()
    let animationFrameId = null

    const tick = (timestamp) => {
      frameCount += 1
      const elapsed = timestamp - lastTimestamp

      if (elapsed >= 1000) {
        setFps(Math.round((frameCount * 1000) / elapsed))
        frameCount = 0
        lastTimestamp = timestamp
      }

      animationFrameId = window.requestAnimationFrame(tick)
    }

    animationFrameId = window.requestAnimationFrame(tick)

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return fps
}

export default useFpsMeter
