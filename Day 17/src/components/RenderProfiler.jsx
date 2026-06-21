import { Profiler } from 'react'

const counts = {}

// Logs commit count + actualDuration per id. Use it to confirm that appending
// a page doesn't re-render the whole list. Dev-only so it never ships.
function onRender(id, phase, actualDuration) {
  counts[id] = (counts[id] || 0) + 1
  console.debug(`[profiler] ${id} commit #${counts[id]} (${phase}) ${actualDuration.toFixed(1)}ms`)
}

export default function RenderProfiler({ id, children }) {
  if (!import.meta.env.DEV) return children
  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  )
}
