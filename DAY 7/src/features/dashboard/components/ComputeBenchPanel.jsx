import { useEffect, useRef, useState } from 'react'
import { fibonacci, findPrimes } from '../utils/heavyMath.js'

function ComputeBenchPanel({ enableWorkers }) {
  const [fibResult, setFibResult] = useState(null)
  const [primeCount, setPrimeCount] = useState(0)
  const [timings, setTimings] = useState({
    fibonacciMain: null,
    fibonacciWorker: null,
    primesMain: null,
    primesWorker: null,
  })

  const fibonacciWorkerRef = useRef(null)
  const primesWorkerRef = useRef(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!enableWorkers) {
      return
    }

    fibonacciWorkerRef.current = new Worker(
      new URL('../../../workers/fibonacci.worker.js', import.meta.url),
      { type: 'module' },
    )
    primesWorkerRef.current = new Worker(
      new URL('../../../workers/primes.worker.js', import.meta.url),
      { type: 'module' },
    )

    return () => {
      fibonacciWorkerRef.current?.terminate()
      primesWorkerRef.current?.terminate()
      fibonacciWorkerRef.current = null
      primesWorkerRef.current = null
    }
  }, [enableWorkers])

  const runWorkerTask = (workerRef, value) => {
    return new Promise((resolve) => {
      requestIdRef.current += 1
      const requestId = requestIdRef.current

      workerRef.current.onmessage = (event) => {
        if (event.data.requestId === requestId) {
          resolve(event.data.result)
        }
      }

      workerRef.current.postMessage({ requestId, value })
    })
  }

  const runFibonacci = async () => {
    const n = 42
    const mainStartedAt = performance.now()
    const mainResult = fibonacci(n)
    const mainDuration = Number((performance.now() - mainStartedAt).toFixed(2))

    let workerDuration = null
    if (enableWorkers && fibonacciWorkerRef.current) {
      const workerStartedAt = performance.now()
      await runWorkerTask(fibonacciWorkerRef, n)
      workerDuration = Number((performance.now() - workerStartedAt).toFixed(2))
    }

    setFibResult(mainResult)
    setTimings((previous) => ({
      ...previous,
      fibonacciMain: mainDuration,
      fibonacciWorker: workerDuration,
    }))
  }

  const runPrimeSearch = async () => {
    const limit = 120000
    const mainStartedAt = performance.now()
    const mainResult = findPrimes(limit)
    const mainDuration = Number((performance.now() - mainStartedAt).toFixed(2))

    let workerDuration = null
    if (enableWorkers && primesWorkerRef.current) {
      const workerStartedAt = performance.now()
      await runWorkerTask(primesWorkerRef, limit)
      workerDuration = Number((performance.now() - workerStartedAt).toFixed(2))
    }

    setPrimeCount(mainResult.length)
    setTimings((previous) => ({
      ...previous,
      primesMain: mainDuration,
      primesWorker: workerDuration,
    }))
  }

  return (
    <section className="panel dashboard-panel">
      <h3>Heavy Computation Bench</h3>
      <p className="exercise-objective">
        Compare main-thread execution vs worker execution for CPU-heavy tasks.
      </p>
      <div className="button-row">
        <button type="button" onClick={runFibonacci}>
          Calculate Fibonacci
        </button>
        <button type="button" onClick={runPrimeSearch}>
          Find Prime Numbers
        </button>
      </div>
      <div className="stats-grid">
        <div>
          <dt>Fibonacci result</dt>
          <dd>{fibResult ?? '-'}</dd>
        </div>
        <div>
          <dt>Prime count</dt>
          <dd>{primeCount || '-'}</dd>
        </div>
        <div>
          <dt>Fibonacci (main / worker)</dt>
          <dd>
            {timings.fibonacciMain ?? '-'}ms /{' '}
            {timings.fibonacciWorker ?? 'disabled'}
          </dd>
        </div>
        <div>
          <dt>Primes (main / worker)</dt>
          <dd>
            {timings.primesMain ?? '-'}ms / {timings.primesWorker ?? 'disabled'}
          </dd>
        </div>
      </div>
    </section>
  )
}

export default ComputeBenchPanel
