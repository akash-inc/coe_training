self.onmessage = (event) => {
  const { items } = event.data
  let total = 0

  for (const item of items) {
    total += item.score
  }

  for (let i = 0; i < 130000; i += 1) {
    total += Math.sin(i % 29) * 0.0001
  }

  self.postMessage({
    averageScore: Number((total / Math.max(items.length, 1)).toFixed(2)),
  })
}
