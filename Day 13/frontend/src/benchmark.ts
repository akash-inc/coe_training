export interface ClientResult {
  clientId: number
  durationMs: number
  sqlQueries: number | null
  ok: boolean
  status: number
  error?: string
}

export interface BenchmarkRun {
  endpointPath: string
  endpointLabel: string
  clientCount: number
  wallMs: number
  results: ClientResult[]
  successCount: number
  failureCount: number
  minMs: number
  maxMs: number
  avgMs: number
  minSqlQueries: number | null
  maxSqlQueries: number | null
  avgSqlQueries: number | null
}

function parseSqlQueryCount(response: Response): number | null {
  const value = response.headers.get('X-Sql-Queries')
  if (value === null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

async function fetchOneClient(clientId: number, path: string): Promise<ClientResult> {
  const started = performance.now()
  try {
    const response = await fetch(path)
    const durationMs = performance.now() - started
    if (!response.ok) {
      const body = await response.text()
      return {
        clientId,
        durationMs,
        sqlQueries: parseSqlQueryCount(response),
        ok: false,
        status: response.status,
        error: body || response.statusText,
      }
    }
    await response.json()
    return {
      clientId,
      durationMs,
      sqlQueries: parseSqlQueryCount(response),
      ok: true,
      status: response.status,
    }
  } catch (error) {
    return {
      clientId,
      durationMs: performance.now() - started,
      sqlQueries: null,
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Request failed',
    }
  }
}

function summarizeSqlQueries(results: ClientResult[]) {
  const counts = results
    .filter((item) => item.ok && item.sqlQueries !== null)
    .map((item) => item.sqlQueries as number)

  if (counts.length === 0) {
    return { minSqlQueries: null, maxSqlQueries: null, avgSqlQueries: null }
  }

  return {
    minSqlQueries: Math.min(...counts),
    maxSqlQueries: Math.max(...counts),
    avgSqlQueries: counts.reduce((sum, value) => sum + value, 0) / counts.length,
  }
}

export async function runParallelClients(
  path: string,
  label: string,
  clientCount: number,
): Promise<BenchmarkRun> {
  const wallStart = performance.now()
  const results = await Promise.all(
    Array.from({ length: clientCount }, (_, index) => fetchOneClient(index + 1, path)),
  )
  const wallMs = performance.now() - wallStart

  const okResults = results.filter((item) => item.ok)
  const durations = okResults.map((item) => item.durationMs)

  const sqlSummary = summarizeSqlQueries(results)

  return {
    endpointPath: path,
    endpointLabel: label,
    clientCount,
    wallMs,
    results,
    successCount: okResults.length,
    failureCount: results.length - okResults.length,
    minMs: durations.length ? Math.min(...durations) : 0,
    maxMs: durations.length ? Math.max(...durations) : 0,
    avgMs: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    ...sqlSummary,
  }
}
