import { useMemo, useState, type FormEvent } from 'react'
import { seedDemoData } from '../api'
import { runParallelClients, type BenchmarkRun } from '../benchmark'
import {
  BENCHMARK_ENDPOINTS,
  COMPARE_PRESETS,
  type BenchmarkEndpoint,
} from '../endpoints'
import { BenchmarkResults } from './BenchmarkResults'
import './ConcurrencyLab.css'

export function ConcurrencyLab() {
  const [clientCount, setClientCount] = useState(10)
  const [selectedId, setSelectedId] = useState('naive')
  const [running, setRunning] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [toast, setToast] = useState('')
  const [singleRun, setSingleRun] = useState<BenchmarkRun | null>(null)
  const [compareRuns, setCompareRuns] = useState<[BenchmarkRun | null, BenchmarkRun | null]>([
    null,
    null,
  ])

  const endpointById = useMemo(
    () => new Map(BENCHMARK_ENDPOINTS.map((item) => [item.id, item])),
    [],
  )

  const selected = endpointById.get(selectedId) ?? BENCHMARK_ENDPOINTS[0]

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 4000)
  }

  async function handleSeed() {
    setSeeding(true)
    try {
      const result = await seedDemoData()
      showToast(result.message)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  async function runEndpoint(endpoint: BenchmarkEndpoint): Promise<BenchmarkRun> {
    return runParallelClients(endpoint.path, endpoint.label, clientCount)
  }

  async function handleSingleRun(event: FormEvent) {
    event.preventDefault()
    setRunning(true)
    setSingleRun(null)
    try {
      setSingleRun(await runEndpoint(selected))
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Benchmark failed')
    } finally {
      setRunning(false)
    }
  }

  async function handleCompare(presetId: string) {
    const preset = COMPARE_PRESETS.find((item) => item.id === presetId)
    if (!preset) return

    const left = endpointById.get(preset.left)
    const right = endpointById.get(preset.right)
    if (!left || !right) return

    setRunning(true)
    setCompareRuns([null, null])
    try {
      const leftRun = await runEndpoint(left)
      const rightRun = await runEndpoint(right)
      setCompareRuns([leftRun, rightRun])
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Compare failed')
    } finally {
      setRunning(false)
    }
  }

  const [leftCompare, rightCompare] = compareRuns
  const compareDelta =
    leftCompare && rightCompare && leftCompare.avgMs > 0
      ? ((rightCompare.avgMs - leftCompare.avgMs) / leftCompare.avgMs) * 100
      : null

  return (
    <div className="concurrency-lab">
      {toast ? <div className="toast">{toast}</div> : null}

      <section className="panel setup-panel">
        <h2>Setup</h2>
        <p>
          Seed demo data, then simulate <strong>multiple browser clients</strong> hitting the same
          API in parallel. Each client opens its own HTTP request (and DB session on the server).
        </p>
        <div className="setup-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSeed}
            disabled={seeding || running}
          >
            {seeding ? 'Seeding…' : 'Seed demo dataset'}
          </button>
          <span className="docs-note">
            See <code>docs/course-enrollment-counts-slow-explain.md</code> in the repo for query
            plans.
          </span>
        </div>
        <p className="tip">
          Tip: set <code>DATABASE_ECHO=true</code> and default pool <code>DB_POOL_SIZE=5</code> in
          `.env`, then run with more than 5 clients to observe connection pooling.
        </p>
      </section>

      <section className="panel controls-panel">
        <h2>Concurrent clients</h2>
        <form className="controls-form" onSubmit={handleSingleRun}>
          <label>
            Parallel clients
            <input
              type="number"
              min={1}
              max={50}
              value={clientCount}
              onChange={(e) => setClientCount(Number(e.target.value))}
            />
          </label>
          <label>
            Endpoint
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <optgroup label="ORM loading">
                {BENCHMARK_ENDPOINTS.filter((e) => e.group === 'loading').map((endpoint) => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="SQL reports">
                {BENCHMARK_ENDPOINTS.filter((e) => e.group === 'report').map((endpoint) => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <button type="submit" className="btn btn-primary" disabled={running}>
            {running ? 'Running…' : 'Run benchmark'}
          </button>
        </form>
        <p className="endpoint-desc">{selected.description}</p>

        <div className="preset-row">
          <span>Compare presets:</span>
          {COMPARE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="btn btn-ghost"
              disabled={running}
              onClick={() => handleCompare(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {singleRun ? (
        <section className="panel">
          <h2>Last run</h2>
          <BenchmarkResults run={singleRun} />
        </section>
      ) : null}

      {leftCompare && rightCompare ? (
        <section className="panel">
          <h2>Comparison</h2>
          <div className="compare-grid">
            <BenchmarkResults run={leftCompare} />
            <BenchmarkResults run={rightCompare} />
          </div>
          {compareDelta !== null ? (
            <p className="compare-summary">
              Right endpoint avg latency is{' '}
              <strong>
                {compareDelta > 0 ? '+' : ''}
                {compareDelta.toFixed(1)}%
              </strong>{' '}
              vs left ({leftCompare.avgMs.toFixed(1)} ms → {rightCompare.avgMs.toFixed(1)} ms per
              client). Wall times: {leftCompare.wallMs.toFixed(1)} ms vs{' '}
              {rightCompare.wallMs.toFixed(1)} ms.
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
