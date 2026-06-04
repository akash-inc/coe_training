import { useMemo, useState, type FormEvent } from 'react'
import { seedLargeDemoData, seedSmallDemoData } from '../api'
import { runParallelClients, type BenchmarkRun } from '../benchmark'
import type { SeedStats } from '../seedData'
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
  const [warmingUp, setWarmingUp] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [toast, setToast] = useState('')
  const [singleRun, setSingleRun] = useState<BenchmarkRun | null>(null)
  const [compareRuns, setCompareRuns] = useState<[BenchmarkRun | null, BenchmarkRun | null]>([
    null,
    null,
  ])
  const [seedStats, setSeedStats] = useState<SeedStats | null>(null)

  const endpointById = useMemo(
    () => new Map(BENCHMARK_ENDPOINTS.map((item) => [item.id, item])),
    [],
  )

  const selected = endpointById.get(selectedId) ?? BENCHMARK_ENDPOINTS[0]

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 5000)
  }

  async function handleSeedSmall() {
    setSeeding(true)
    try {
      const result = await seedSmallDemoData()
      setSeedStats({
        courseCount: result.courses_added,
        enrollmentCount: result.enrollments_added,
        studentCount: result.students_added,
      })
      showToast(
        `${result.message} (${result.students_added} students, ${result.courses_added} courses)`,
      )
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  async function handleSeedLarge() {
    setSeeding(true)
    try {
      const result = await seedLargeDemoData()
      setSeedStats({
        courseCount: result.courses_added,
        enrollmentCount: result.enrollments_added,
        studentCount: result.students_added,
      })
      showToast(
        `Large seed complete: ${result.courses_added} courses, ${result.enrollments_added} enrollments`,
      )
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Large seed failed')
    } finally {
      setSeeding(false)
    }
  }

  async function runEndpoint(endpoint: BenchmarkEndpoint): Promise<BenchmarkRun> {
    setWarmingUp(true)
    try {
      return await runParallelClients(
        endpoint.id,
        endpoint.path,
        endpoint.label,
        clientCount,
        { warmup: true },
      )
    } finally {
      setWarmingUp(false)
    }
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
      setWarmingUp(true)
      await runParallelClients(left.id, left.path, left.label, clientCount, { warmup: true })
      setWarmingUp(false)
      const leftRun = await runParallelClients(left.id, left.path, left.label, clientCount, {
        warmup: false,
      })

      setWarmingUp(true)
      await runParallelClients(right.id, right.path, right.label, clientCount, { warmup: true })
      setWarmingUp(false)
      const rightRun = await runParallelClients(right.id, right.path, right.label, clientCount, {
        warmup: false,
      })

      setCompareRuns([leftRun, rightRun])
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Compare failed')
    } finally {
      setWarmingUp(false)
      setRunning(false)
    }
  }

  const [leftCompare, rightCompare] = compareRuns
  const compareDelta =
    leftCompare && rightCompare && leftCompare.avgMs > 0
      ? ((rightCompare.avgMs - leftCompare.avgMs) / leftCompare.avgMs) * 100
      : null
  const sqlCompareDelta =
    leftCompare &&
    rightCompare &&
    leftCompare.avgSqlQueries !== null &&
    rightCompare.avgSqlQueries !== null &&
    leftCompare.avgSqlQueries > 0
      ? ((rightCompare.avgSqlQueries - leftCompare.avgSqlQueries) /
          leftCompare.avgSqlQueries) *
        100
      : null

  const runLabel = warmingUp ? 'Warming up…' : running ? 'Running…' : 'Run benchmark'

  return (
    <div className="concurrency-lab">
      {toast ? <div className="toast">{toast}</div> : null}

      <section className="panel setup-panel">
        <h2>Setup</h2>
        <p>
          Seed data, then simulate <strong>multiple browser clients</strong> in parallel. Benchmarks
          run a <strong>warm-up</strong> first (discarded), then record the second run.
        </p>
        <div className="setup-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleSeedSmall}
            disabled={seeding || running}
          >
            {seeding ? 'Seeding…' : 'Seed small (3 courses)'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSeedLarge}
            disabled={seeding || running}
          >
            {seeding ? 'Seeding…' : 'Seed large (50 courses × 200 enrollments)'}
          </button>
        </div>
        {seedStats ? (
          <p className="tip">
            Current seed: <strong>{seedStats.courseCount} courses</strong>,{' '}
            <strong>{seedStats.enrollmentCount} enrollments</strong> — expected counts use these
            values (e.g. naive ≈ 1 + {seedStats.courseCount} + {seedStats.enrollmentCount}).
          </p>
        ) : (
          <p className="tip">
            Seed the database first so expected query counts show numeric estimates.
          </p>
        )}
        <p className="tip">
          Use the <strong>large seed</strong> before comparing naive vs selectinload or slow vs
          optimized reports. Set <code>DATABASE_ECHO=true</code> to watch SQL in the API terminal.
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
          <button type="submit" className="btn btn-primary" disabled={running || seeding}>
            {runLabel}
          </button>
        </form>
        <p className="endpoint-desc">{selected.description}</p>

        <div className="preset-row">
          <span>Compare presets (warm-up each side, then record):</span>
          {COMPARE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="btn btn-ghost"
              disabled={running || seeding}
              onClick={() => handleCompare(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {singleRun ? (
        <section className="panel">
          <h2>Recorded run (after warm-up)</h2>
          <BenchmarkResults run={singleRun} seedStats={seedStats} />
        </section>
      ) : null}

      {leftCompare && rightCompare ? (
        <section className="panel">
          <h2>Comparison (recorded runs)</h2>
          <div className="compare-grid">
            <BenchmarkResults run={leftCompare} seedStats={seedStats} />
            <BenchmarkResults run={rightCompare} seedStats={seedStats} />
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
              {sqlCompareDelta !== null ? (
                <>
                  {' '}
                  Avg <code>X-Sql-Queries</code>: {leftCompare.avgSqlQueries?.toFixed(0)} →{' '}
                  {rightCompare.avgSqlQueries?.toFixed(0)} (
                  {sqlCompareDelta > 0 ? '+' : ''}
                  {sqlCompareDelta.toFixed(1)}%).
                </>
              ) : null}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
