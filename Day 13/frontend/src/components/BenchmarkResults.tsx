import type { BenchmarkRun } from '../benchmark'
import { compareActualToExpected, getExpectedQueryInfo } from '../expectedQueries'
import type { SeedStats } from '../seedData'
import './BenchmarkResults.css'

interface BenchmarkResultsProps {
  run: BenchmarkRun | null
  seedStats: SeedStats | null
}

const MATCH_LABELS = {
  match: 'Matches expected',
  close: 'Close to expected',
  off: 'Differs from expected',
  unknown: 'Seed data needed for numeric estimate',
} as const

export function BenchmarkResults({ run, seedStats }: BenchmarkResultsProps) {
  if (!run) return null

  const expected = getExpectedQueryInfo(run.endpointId, seedStats)
  const comparison =
    run.avgSqlQueries !== null
      ? compareActualToExpected(run.avgSqlQueries, run.endpointId, seedStats)
      : { status: 'unknown' as const, expected: null }

  return (
    <div className="benchmark-results">
      <header className="results-head">
        <h3>{run.endpointLabel}</h3>
        <code>{run.endpointPath}</code>
      </header>

      <div className="stats-grid">
        <div className="stat">
          <span className="stat-label">Clients</span>
          <strong>{run.clientCount}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Wall time</span>
          <strong>{run.wallMs.toFixed(1)} ms</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Avg / client</span>
          <strong>{run.avgMs.toFixed(1)} ms</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Min – Max</span>
          <strong>
            {run.minMs.toFixed(1)} – {run.maxMs.toFixed(1)} ms
          </strong>
        </div>
        <div className="stat">
          <span className="stat-label">OK / Failed</span>
          <strong>
            {run.successCount} / {run.failureCount}
          </strong>
        </div>
        {run.avgSqlQueries !== null ? (
          <div className="stat stat-sql">
            <span className="stat-label">SQL queries (server)</span>
            <strong>
              avg {run.avgSqlQueries.toFixed(0)} ({run.minSqlQueries}–{run.maxSqlQueries})
            </strong>
          </div>
        ) : null}
      </div>

      <div className={`expected-queries expected-${comparison.status}`}>
        <strong>Expected query count</strong>
        <p className="expected-formula">
          <code>{expected.formula}</code>
          {expected.estimateLabel ? <> → {expected.estimateLabel}</> : null}
        </p>
        <p className="expected-detail">{expected.explanation}</p>
        {run.avgSqlQueries !== null && comparison.expected !== null ? (
          <p className="expected-compare">
            Observed avg <strong>{run.avgSqlQueries.toFixed(0)}</strong> vs expected{' '}
            <strong>{comparison.expected}</strong> — {MATCH_LABELS[comparison.status]}
          </p>
        ) : (
          <p className="expected-compare">{MATCH_LABELS[comparison.status]}</p>
        )}
      </div>

      <p className="results-hint">
        Recorded after a discarded warm-up run. Each bar is one parallel client;{' '}
        <code>X-Sql-Queries</code> is the server statement count for that request.
      </p>

      <div className="client-grid" role="list">
        {run.results.map((result) => (
          <div
            key={result.clientId}
            role="listitem"
            className={`client-card ${result.ok ? 'ok' : 'fail'}`}
            title={result.error}
          >
            <span className="client-id">Client {result.clientId}</span>
            <span className="client-ms">{result.durationMs.toFixed(1)} ms</span>
            <span className="client-status">
              {result.ok ? 'OK' : `ERR ${result.status}`}
              {result.sqlQueries !== null ? ` · ${result.sqlQueries} SQL` : ''}
            </span>
            <div
              className="client-bar"
              style={{
                width: `${Math.min(100, (result.durationMs / Math.max(run.maxMs, 1)) * 100)}%`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
