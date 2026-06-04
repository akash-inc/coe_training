export type EndpointGroup = 'loading' | 'report' | 'pool'

export interface BenchmarkEndpoint {
  id: string
  label: string
  path: string
  group: EndpointGroup
  description: string
}

export interface ComparePreset {
  id: string
  label: string
  left: string
  right: string
  leftCaption: string
  rightCaption: string
}

export const BENCHMARK_ENDPOINTS: BenchmarkEndpoint[] = [
  {
    id: 'naive',
    label: 'Naive (N+1)',
    path: '/courses-with-students-naive',
    group: 'loading',
    description: 'Lazy loads enrollments and students per course',
  },
  {
    id: 'joinedload',
    label: 'Joinedload',
    path: '/courses-with-students-eager-joinedload',
    group: 'loading',
    description: 'Single query with joins',
  },
  {
    id: 'selectin',
    label: 'Selectinload',
    path: '/courses-with-students-selectin',
    group: 'loading',
    description: 'Batched IN queries for collections',
  },
  {
    id: 'subquery',
    label: 'Subqueryload',
    path: '/courses-with-students-subquery',
    group: 'loading',
    description: 'Subquery-based collection load',
  },
  {
    id: 'report-slow',
    label: 'Report (correlated subquery)',
    path: '/report/course-enrollment-counts-slow',
    group: 'report',
    description: 'SubPlan per course row',
  },
  {
    id: 'report-fast',
    label: 'Report (JOIN + GROUP BY)',
    path: '/report/course-enrollment-counts',
    group: 'report',
    description: 'Hash aggregate over one join',
  },
  {
    id: 'db-unpooled',
    label: 'DB ping (unpooled)',
    path: '/benchmark/db-ping-unpooled',
    group: 'pool',
    description: 'NullPool — new connection per request',
  },
  {
    id: 'db-pooled',
    label: 'DB ping (pooled)',
    path: '/benchmark/db-ping-pooled',
    group: 'pool',
    description: 'QueuePool — reuse connections from the pool',
  },
]

export const COMPARE_PRESETS: ComparePreset[] = [
  {
    id: 'loading',
    label: 'Naive vs Selectinload',
    left: 'naive',
    right: 'selectin',
    leftCaption: 'Unoptimized ORM (N+1 queries)',
    rightCaption: 'Optimized loading (batched queries)',
  },
  {
    id: 'report',
    label: 'Slow vs optimized report',
    left: 'report-slow',
    right: 'report-fast',
    leftCaption: 'Correlated subquery per course',
    rightCaption: 'JOIN + GROUP BY aggregate',
  },
  {
    id: 'pool',
    label: 'Unpooled vs connection pool',
    left: 'db-unpooled',
    right: 'db-pooled',
    leftCaption: 'NullPool — new TCP connection each request',
    rightCaption: 'QueuePool — shared pool, checkout & return',
  },
]
