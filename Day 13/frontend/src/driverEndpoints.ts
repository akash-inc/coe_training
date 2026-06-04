export interface DriverBenchmarkEndpoint {
  id: string
  label: string
  path: string
  description: string
}

export const ORM_VS_RAW_PRESET = {
  left: {
    id: 'report-sqlalchemy',
    label: 'Enrollment report (SQLAlchemy)',
    path: '/report/course-enrollment-counts',
    description: 'Session + text() — same SQL as raw side',
  },
  right: {
    id: 'report-raw',
    label: 'Enrollment report (psycopg3 raw)',
    path: '/report/course-enrollment-counts-raw',
    description: 'Direct psycopg3 connect + execute per request',
  },
  leftCaption: 'SQLAlchemy Session + text()',
  rightCaption: 'psycopg3 raw SQL (no ORM session)',
} as const satisfies {
  left: DriverBenchmarkEndpoint
  right: DriverBenchmarkEndpoint
  leftCaption: string
  rightCaption: string
}
