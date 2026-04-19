export function buildItems(size = 2400) {
  const items = []

  for (let i = 0; i < size; i += 1) {
    items.push({
      id: `row-${i}`,
      title: `Render row ${i}`,
      category: i % 3 === 0 ? 'hot' : 'cold',
      score: (i * 17) % 101,
    })
  }

  return items
}

export function expensiveFilter(items, query) {
  const normalizedQuery = query.trim().toLowerCase()
  let _wastedCycles = 0

  for (let i = 0; i < 40000; i += 1) {
    _wastedCycles += Math.sqrt((i % 19) + 1)
  }

  if (!normalizedQuery) {
    return items
  }

  return items.filter((item) => {
    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.category.includes(normalizedQuery)
    )
  })
}

export function expensiveStats(items) {
  let hotCount = 0
  let coldCount = 0
  let scoreTotal = 0

  for (const item of items) {
    if (item.category === 'hot') {
      hotCount += 1
    } else {
      coldCount += 1
    }
    scoreTotal += item.score
  }

  // TODO(exercise-10-worker): move this CPU-heavy block into a Web Worker.
  for (let i = 0; i < 130000; i += 1) {
    scoreTotal += Math.sin(i % 31) * 0.0001
  }

  return {
    hotCount,
    coldCount,
    avgScore: Number((scoreTotal / Math.max(items.length, 1)).toFixed(2)),
  }
}
