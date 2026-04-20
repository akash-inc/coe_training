self.onmessage = (event) => {
  const { requestId, value } = event.data
  const limit = value

  if (limit < 2) {
    self.postMessage({ requestId, primeCount: 0 })
    return
  }

  const sieve = new Array(limit + 1).fill(true)
  sieve[0] = false
  sieve[1] = false

  for (let i = 2; i * i <= limit; i += 1) {
    if (!sieve[i]) {
      continue
    }
    for (let j = i * i; j <= limit; j += i) {
      sieve[j] = false
    }
  }

  let primeCount = 0
  for (let i = 2; i <= limit; i += 1) {
    if (sieve[i]) {
      primeCount += 1
    }
  }

  self.postMessage({ requestId, primeCount })
}
