import { useState } from 'react'
import { seedLargeDemoData, seedSmallDemoData } from '../api'
import { runParallelClients, type BenchmarkRun } from '../benchmark'
import { ORM_VS_RAW_PRESET } from '../driverEndpoints'
import type { SeedStats } from '../seedData'
import { BenchmarkResults } from './BenchmarkResults'
import './ConcurrencyLab.css'

export function OrmVsRawLab() {
  const [clientCount, setClientCount] = useState(10)
  const [running, setRunning] = useState(false)
  const [warmingUp, setWarmingUp] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [toast, setToast] = useState('')
  const [compareRuns, setCompareRuns] = useState<[BenchmarkRun | null, BenchmarkRun | null]>([
    null,
    null,
  ])
  const [seedStats, setSeedStats] = useState<SeedStats | null>(null)

  const { left, right, leftCaption, rightCaption } = ORM_VS_RAW_PRESET

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

  async function handleCompare() {
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

  const runLabel = warmingUp ? 'Warming up…' : running ? 'Running…' : 'Run comparison'

  return (
    <div className="concurrency-lab">
      {toast ? <div className="toast">{toast}</div> : null}

      <section className="panel setup-panel">
        <h2>ORM vs raw SQL</h2>
        <p>
          Both sides run the <strong>same enrollment-count SQL</strong> (JOIN + GROUP BY). Left uses
          SQLAlchemy <code>Session</code> + <code>text()</code>; right uses{' '}
          <code>psycopg3</code> with a new connection per request. Use <strong>Seed large</strong>{' '}
          so timings reflect real row volume, not an empty database.
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
            <strong>{seedStats.enrollmentCount} enrollments</strong>.
          </p>
        ) : (
          <p className="tip">Seed the database first for meaningful latency differences.</p>
        )}
      </section>

      <section className="panel">
        <h2>Parallel clients</h2>
        <form
          className="controls-form"
          onSubmit={(event) => {
            event.preventDefault()
            void handleCompare()
          }}
        >
          <label>
            Parallel clients
            <input
              type="number"
              min={1}
              max={100}
              value={clientCount}
              onChange={(event) => setClientCount(Number(event.target.value))}
              disabled={running}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={running || seeding}>
            {runLabel}
          </button>
        </form>
        <p className="compare-captions" style={{ marginTop: '1rem' }}>
          <span>
            <strong>Left:</strong> {leftCaption}
          </span>
          <span>
            <strong>Right:</strong> {rightCaption}
          </span>
        </p>
      </section>

      {leftCompare && rightCompare ? (
        <section className="panel">
          <h2>Comparison (recorded runs)</h2>
          {compareDelta !== null ? (
            <p className="tip">
              Right vs left latency:{' '}
              <strong>
                {compareDelta > 0 ? '+' : ''}
                {compareDelta.toFixed(1)}%
              </strong>{' '}
              (negative means raw is faster).
            </p>
          ) : null}
          <div className="compare-grid">
            <BenchmarkResults run={leftCompare} seedStats={seedStats} />
            <BenchmarkResults run={rightCompare} seedStats={seedStats} />
          </div>
        </section>
      ) : null}

      <section className="panel explanation-panel">
        <h2>Why is SQLAlchemy often faster here?</h2>
        <p>
          This lab is not proof that ORMs beat raw SQL in general. Both sides send the{' '}
          <strong>same SQL</strong> to PostgreSQL, so the database does the same work. When the left
          side wins under parallel clients, it is usually for reasons visible in this setup:
        </p>
        <ul>
          <li>
            <strong>Connection pooling on the left.</strong> The SQLAlchemy route uses{' '}
            <code>get_db</code> and a shared <code>QueuePool</code> — each request checks out an
            existing TCP connection and returns it. The raw route calls{' '}
            <code>psycopg.connect()</code> per request and closes it when done, paying handshake and
            auth on every parallel client.
          </li>
          <li>
            <strong>Not full ORM loading.</strong> The left path uses <code>Session.execute(text(...))</code>{' '}
            and row mappings, not <code>db.query(Course)</code> with relationship traversal. ORM
            object hydration overhead is minimal here; you are mostly comparing pool reuse vs
            connect-per-request.
          </li>
          <li>
            <strong>Concurrency amplifies connection cost.</strong> With many browser clients at
            once, time spent opening sockets often dominates a single cheap <code>SELECT</code>. That
            is why the gap grows when you raise parallel clients — not because the raw SQL plan is
            worse.
          </li>
          <li>
            <strong>Same query count.</strong> Both sides should show <code>X-Sql-Queries: 1</code>.
            A faster left side means lower overhead around the query, not fewer round-trips to the
            database.
          </li>
        </ul>
        <p className="tip">
          Raw SQL can match or beat this path once you add a connection pool (see the{' '}
          <strong>Query lab</strong> pool compare) or use a long-lived connection. Use ORM/SQLAlchemy
          for models and relationship loading; use raw SQL where you want explicit control — and
          always pool connections in production APIs.
        </p>
      </section>
    </div>
  )
}
