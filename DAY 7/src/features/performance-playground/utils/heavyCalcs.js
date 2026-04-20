export function computeHeavyStats(numbers, intensity = 1) {
  const startedAt = performance.now()
  let sum = 0

  for (const number of numbers) {
    sum += number
  }

  const rounds = Math.floor(600000 * intensity)
  for (let i = 0; i < rounds; i += 1) {
    sum += Math.sin((i % 29) + 1) * 0.0001
  }

  return {
    average: Number((sum / Math.max(numbers.length, 1)).toFixed(4)),
    durationMs: Number((performance.now() - startedAt).toFixed(2)),
  }
}

export function fibonacci(n) {
  if (n <= 1) {
    return n
  }

  let prev = 0
  let current = 1
  for (let i = 2; i <= n; i += 1) {
    const next = prev + current
    prev = current
    current = next
  }

  return current
}

export function findPrimes(limit) {
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

  const primes = []
  for (let i = 2; i <= limit; i += 1) {
    if (sieve[i]) {
      primes.push(i)
    }
  }
  return primes
}
