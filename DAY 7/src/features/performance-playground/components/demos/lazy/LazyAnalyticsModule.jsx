import { useEffect, useMemo } from 'react'

function LazyAnalyticsModule({ title, onReady }) {
  const result = useMemo(() => {
    let value = 0
    for (let i = 0; i < 250000; i += 1) {
      value += Math.sqrt((i % 37) + 1)
    }
    return Math.round(value)
  }, [])

  useEffect(() => {
    onReady?.()
  }, [onReady])

  return (
    <div className="mini-card">
      <strong>{title}</strong>
      <p className="meta">Heavy analytics checksum: {result}</p>
    </div>
  )
}

export default LazyAnalyticsModule
