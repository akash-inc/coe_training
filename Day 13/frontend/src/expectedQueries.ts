import type { SeedStats } from './seedData'

export interface ExpectedQueryInfo {
  formula: string
  estimateLabel: string | null
  explanation: string
}

function withCounts(
  formula: string,
  estimate: number,
  explanation: string,
): ExpectedQueryInfo {
  return {
    formula,
    estimateLabel: `≈ ${estimate} queries`,
    explanation,
  }
}

function formulaOnly(formula: string, explanation: string): ExpectedQueryInfo {
  return { formula, estimateLabel: null, explanation }
}

export function getExpectedQueryInfo(
  endpointId: string,
  stats: SeedStats | null,
): ExpectedQueryInfo {
  const courses = stats?.courseCount ?? null
  const enrollments = stats?.enrollmentCount ?? null

  switch (endpointId) {
    case 'naive':
      if (courses !== null && enrollments !== null) {
        return withCounts(
          '1 + courses + enrollments',
          1 + courses + enrollments,
          'List courses, then lazy-load enrollments per course and students per enrollment.',
        )
      }
      return formulaOnly(
        '1 + courses + enrollments',
        'One query for all courses, plus one per course for enrollments, plus one per enrollment for students.',
      )

    case 'joinedload':
      return withCounts('≈ 1', 1, 'Single SELECT with JOINs loads courses, enrollments, and students.')

    case 'selectin':
      return withCounts(
        '≈ 3',
        3,
        'Courses, then batched enrollments (IN), then batched students (IN).',
      )

    case 'subquery':
      return withCounts(
        '≈ 3',
        3,
        'Courses, then subquery-loaded enrollments, then students for those rows.',
      )

    case 'report-slow':
      if (courses !== null) {
        return withCounts(
          '1 + courses',
          1 + courses,
          'Scan courses; correlated subquery counts enrollments once per course row.',
        )
      }
      return formulaOnly(
        '1 + courses',
        'One query for courses plus a SubPlan execution per course for enrollment counts.',
      )

    case 'report-fast':
      return withCounts(
        '≈ 1',
        1,
        'One grouped query: LEFT JOIN enrollments and COUNT in a single pass.',
      )

    case 'db-unpooled':
      return formulaOnly(
        '≈ 1 SQL · new connection each request',
        'NullPool opens and closes a TCP connection per request — high overhead under concurrency.',
      )

    case 'db-pooled':
      return formulaOnly(
        '≈ 1 SQL · pooled connection',
        'QueuePool reuses connections (pool_size + overflow). Parallel clients share the pool instead of handshaking every time.',
      )

    case 'report-sqlalchemy':
      return withCounts(
        '≈ 1',
        1,
        'SQLAlchemy Session executes the shared JOIN + GROUP BY via text().',
      )

    case 'report-raw':
      return formulaOnly(
        '≈ 1 SQL · psycopg3 per request',
        'Same SQL string; psycopg3 opens a connection per request (no SQLAlchemy pool on this path).',
      )

    default:
      return formulaOnly('—', 'No estimate for this endpoint.')
  }
}

export function parseEstimate(endpointId: string, stats: SeedStats | null): number | null {
  const label = getExpectedQueryInfo(endpointId, stats).estimateLabel
  if (!label) return null
  const match = label.match(/≈ (\d+)/)
  return match ? Number(match[1]) : null
}

export type EstimateMatch = 'match' | 'close' | 'off' | 'unknown'

export function compareActualToExpected(
  actual: number | null,
  endpointId: string,
  stats: SeedStats | null,
): { status: EstimateMatch; expected: number | null } {
  const expected = parseEstimate(endpointId, stats)
  if (actual === null || expected === null) {
    return { status: 'unknown', expected }
  }
  if (actual === expected) return { status: 'match', expected }
  const tolerance = Math.max(2, Math.floor(expected * 0.15))
  if (Math.abs(actual - expected) <= tolerance) return { status: 'close', expected }
  return { status: 'off', expected }
}
