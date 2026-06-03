export type EndpointGroup = 'loading' | 'report'

export interface BenchmarkEndpoint {
  id: string
  label: string
  path: string
  group: EndpointGroup
  description: string
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
]

export const COMPARE_PRESETS = [
  {
    id: 'loading',
    label: 'Naive vs Selectinload',
    left: 'naive',
    right: 'selectin',
  },
  {
    id: 'report',
    label: 'Slow vs optimized report',
    left: 'report-slow',
    right: 'report-fast',
  },
] as const
