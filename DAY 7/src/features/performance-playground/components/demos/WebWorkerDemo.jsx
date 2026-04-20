import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ComparisonPanel from '../ComparisonPanel.jsx'
import { fibonacci, findPrimes } from '../../utils/heavyCalcs.js'

function WebWorkerDemo({ stressSignal, onMetrics }) {
  const [leftBusy, setLeftBusy] = useState(false)
  const [rightBusy, setRightBusy] = useState(false)
  const [leftFib, setLeftFib] = useState(null)
  const [rightFib, setRightFib] = useState(null)
  const [leftPrimeCount, setLeftPrimeCount] = useState(0)
  const [rightPrimeCount, setRightPrimeCount] = useState(0)
  const [leftTime, setLeftTime] = useState(0)
  const [rightTime, setRightTime] = useState(0)
  const [leftUiLagMs, setLeftUiLagMs] = useState(0)
  const [rightUiLagMs, setRightUiLagMs] = useState(0)
  const [leftPings, setLeftPings] = useState(0)
  const [rightPings, setRightPings] = useState(0)

  const fibWorkerRef = useRef(null)
  const primesWorkerRef = useRef(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    fibWorkerRef.current = new Worker(
      new URL('../../../../workers/playground-fib.worker.js', import.meta.url),
      { type: 'module' },
    )
    primesWorkerRef.current = new Worker(
      new URL('../../../../workers/playground-primes.worker.js', import.meta.url),
      { type: 'module' },
    )

    return () => {
      fibWorkerRef.current?.terminate()
      primesWorkerRef.current?.terminate()
    }
  }, [])

  const runWorkerTask = useCallback((workerRef, value) =>
    new Promise((resolve) => {
      requestIdRef.current += 1
      const requestId = requestIdRef.current
      workerRef.current.onmessage = (event) => {
        if (event.data.requestId === requestId) {
          resolve(event.data)
        }
      }
      workerRef.current.postMessage({ requestId, value })
    }), [])

  const measureUiLag = (setter) => {
    const marker = performance.now()
    window.setTimeout(() => {
      setter(Number((performance.now() - marker).toFixed(2)))
    }, 0)
  }

  const runMainThreadHeavy = useCallback(() => {
    setLeftBusy(true)
    measureUiLag(setLeftUiLagMs)
    const startedAt = performance.now()
    const fibValue = fibonacci(45)
    const primes = findPrimes(350000)
    setLeftFib(fibValue)
    setLeftPrimeCount(primes.length)
    setLeftTime(Number((performance.now() - startedAt).toFixed(2)))
    setLeftBusy(false)
  }, [])

  const runWorkerHeavy = useCallback(async () => {
    if (!fibWorkerRef.current || !primesWorkerRef.current) {
      return
    }
    setRightBusy(true)
    measureUiLag(setRightUiLagMs)
    const startedAt = performance.now()
    const [fibResponse, primesResponse] = await Promise.all([
      runWorkerTask(fibWorkerRef, 45),
      runWorkerTask(primesWorkerRef, 350000),
    ])

    setRightFib(fibResponse.result)
    setRightPrimeCount(primesResponse.primeCount)
    setRightTime(Number((performance.now() - startedAt).toFixed(2)))
    setRightBusy(false)
  }, [runWorkerTask])

  useEffect(() => {
    if (stressSignal > 0) {
      const timerId = window.setTimeout(() => {
        runMainThreadHeavy()
        runWorkerHeavy()
      }, 0)
      return () => {
        window.clearTimeout(timerId)
      }
    }
    return undefined
  }, [runMainThreadHeavy, runWorkerHeavy, stressSignal])

  const badStats = useMemo(
    () => ({
      renders: leftBusy ? 180 : 40,
      timeMs: leftTime || 300,
    }),
    [leftBusy, leftTime],
  )
  const goodStats = useMemo(
    () => ({
      renders: rightBusy ? 70 : 30,
      timeMs: rightTime || 60,
    }),
    [rightBusy, rightTime],
  )

  useEffect(() => {
    onMetrics('web-worker', 'unoptimized', badStats)
    onMetrics('web-worker', 'optimized', goodStats)
  }, [badStats, goodStats, onMetrics])

  return (
    <ComparisonPanel
      title="7) Web Worker Demo"
      description="Heavy computations on main thread block UI; workers keep UI interactive."
      badStats={badStats}
      goodStats={goodStats}
      badPane={
        <div>
          <button type="button" onClick={runMainThreadHeavy}>
            Calculate Primes + Fibonacci
          </button>
          <button type="button" onClick={() => setLeftPings((value) => value + 1)}>
            Ping UI ({leftPings})
          </button>
          <p className="meta">{leftBusy ? 'Main Thread Blocked' : 'Idle'}</p>
          <p className="meta">Fib: {leftFib ?? '-'}</p>
          <p className="meta">Primes: {leftPrimeCount || '-'}</p>
          <p className="meta">Completion: {leftTime || '-'}ms</p>
          <p className="meta">UI block lag: {leftUiLagMs || '-'}ms</p>
        </div>
      }
      goodPane={
        <div>
          <button type="button" onClick={runWorkerHeavy}>
            Calculate Primes + Fibonacci
          </button>
          <button type="button" onClick={() => setRightPings((value) => value + 1)}>
            Ping UI ({rightPings})
          </button>
          <p className="meta">{rightBusy ? 'Background worker running' : 'UI Responsive'}</p>
          <p className="meta">Fib: {rightFib ?? '-'}</p>
          <p className="meta">Primes: {rightPrimeCount || '-'}</p>
          <p className="meta">Completion: {rightTime || '-'}ms</p>
          <p className="meta">UI block lag: {rightUiLagMs || '-'}ms</p>
        </div>
      }
    />
  )
}

export default WebWorkerDemo
