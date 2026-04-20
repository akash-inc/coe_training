self.onmessage = (event) => {
  const { requestId, value } = event.data

  if (value < 2) {
    self.postMessage({ requestId, result: [] })
    return
  }

  const sieve = new Array(value + 1).fill(true)
  sieve[0] = false
  sieve[1] = false

  for (let i = 2; i * i <= value; i += 1) {
    if (!sieve[i]) {
      continue
    }
    for (let j = i * i; j <= value; j += i) {
      sieve[j] = false
    }
  }

  const primes = []
  for (let i = 2; i <= value; i += 1) {
    if (sieve[i]) {
      primes.push(i)
    }
  }

  self.postMessage({ requestId, result: primes })
}
