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
  if (limit < 2) {
    return []
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

  const primes = []
  for (let i = 2; i <= limit; i += 1) {
    if (sieve[i]) {
      primes.push(i)
    }
  }

  return primes
}
