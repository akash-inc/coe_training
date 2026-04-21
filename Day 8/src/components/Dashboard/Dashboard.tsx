import { useMemo } from "react"
import {
  computeDashboardMetrics,
  type DashboardTrend,
} from "../../lib/analytics/dashboardMetrics"
import type { Task } from "../../types"
import "./Dashboard.css"

const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 3_600_000
const MS_PER_DAY = 86_400_000

type DashboardProps = {
  tasks: Task[]
}

function formatLeadTimeForDisplay(durationMs: number | null): string {
  if (durationMs == null || Number.isNaN(durationMs)) {
    return "—"
  }

  const wholeDays = Math.floor(durationMs / MS_PER_DAY)
  const remainderAfterDays = durationMs % MS_PER_DAY
  const wholeHours = Math.floor(remainderAfterDays / MS_PER_HOUR)

  if (wholeDays > 0) {
    return `${wholeDays}d ${wholeHours}h`
  }
  if (wholeHours > 0) {
    return `${wholeHours}h`
  }

  const roundedMinutes = Math.max(1, Math.round(durationMs / MS_PER_MINUTE))
  return `${roundedMinutes}m`
}

function formatTrendForDisplay(trend: DashboardTrend): string {
  switch (trend) {
    case "improving":
      return "Improving (faster than the prior period)"
    case "declining":
      return "Declining (slower than the prior period)"
    case "stable":
      return "Stable (similar to the prior period)"
    case "none":
      return "—"
    default: {
      const exhaustive: never = trend
      return exhaustive
    }
  }
}

export default function Dashboard({ tasks }: DashboardProps) {
  const metrics = useMemo(() => {
    return computeDashboardMetrics(
      tasks,
      // eslint-disable-next-line react-hooks/purity -- overdue/trend need wall time; recomputed when `tasks` change
      Date.now(),
    )
  }, [tasks])

  return (
    <section
      className="kanban-dashboard"
      aria-label="Analytics dashboard"
    >
      <h2 className="kanban-dashboard-heading">Dashboard</h2>
      <dl className="kanban-dashboard-metrics">
        <div className="kanban-dashboard-metric">
          <dt>Total tasks</dt>
          <dd>{metrics.totalTasks}</dd>
        </div>
        <div className="kanban-dashboard-metric">
          <dt>Completion</dt>
          <dd>{metrics.completionPercentage}%</dd>
        </div>
        <div className="kanban-dashboard-metric">
          <dt>Active</dt>
          <dd>{metrics.activeCount}</dd>
        </div>
        <div className="kanban-dashboard-metric">
          <dt>Completed</dt>
          <dd>{metrics.completedCount}</dd>
        </div>
        <div className="kanban-dashboard-metric">
          <dt>Overdue</dt>
          <dd>{metrics.overdueCount}</dd>
        </div>
        <div className="kanban-dashboard-metric">
          <dt>Avg. completion time</dt>
          <dd>{formatLeadTimeForDisplay(metrics.averageCompletionTimeMs)}</dd>
        </div>
        <div className="kanban-dashboard-metric kanban-dashboard-metric-wide">
          <dt>Trend</dt>
          <dd>{formatTrendForDisplay(metrics.trend)}</dd>
        </div>
      </dl>
    </section>
  )
}
