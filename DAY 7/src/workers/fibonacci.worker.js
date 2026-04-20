self.onmessage = (event) => {
  const { requestId, value } = event.data

  if (value <= 1) {
    self.postMessage({ requestId, result: value })
    return
  }

  let prev = 0
  let current = 1
  for (let i = 2; i <= value; i += 1) {
    const next = prev + current
    prev = current
    current = next
  }

  self.postMessage({ requestId, result: current })
}
