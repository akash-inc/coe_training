const counts = {}

export function markRender(name) {
  counts[name] = (counts[name] ?? 0) + 1
}

export function getRenderCounts() {
  return Object.entries(counts)
    .map(([component, count]) => ({ component, count }))
    .sort((a, b) => a.component.localeCompare(b.component))
}

export function resetRenderCounts() {
  Object.keys(counts).forEach((key) => {
    counts[key] = 0
  })
}
