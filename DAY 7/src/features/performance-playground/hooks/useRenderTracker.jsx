import { useId } from 'react'

const renderCounts = new Map()

function useRenderTracker() {
  const trackerId = useId()
  const nextCount = (renderCounts.get(trackerId) ?? 0) + 1
  renderCounts.set(trackerId, nextCount)

  const flashClass = nextCount % 2 === 0 ? 'render-flash-a' : 'render-flash-b'

  return {
    renderCount: nextCount,
    flashClass,
  }
}

export default useRenderTracker
