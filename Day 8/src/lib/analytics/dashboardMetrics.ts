import type { Task } from "../../types"

/** Length of each trend period; we compare the latest period to the one immediately before it. */
const DEFAULT_TREND_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Median lead time must move by roughly this much vs the prior period to call a trend
 * (dampens jitter when sample sizes are small).
 */
const TREND_IMPROVING_MAX_RATIO = 0.97
const TREND_DECLINING_MIN_RATIO = 1.03

export type DashboardTrend =
  | "improving"
  | "declining"
  | "stable"
  /** No Done tasks with a measurable lead time (created → completed). */
  | "none"

export type DashboardMetrics = {
  totalTasks: number
  completionPercentage: number
  activeCount: number
  completedCount: number
  overdueCount: number
  averageCompletionTimeMs: number | null
  trend: DashboardTrend
}

function taskIsInDoneColumn(task: Task): boolean {
  return task.column === "Done"
}

function leadTimeMsForCompletedTask(task: Task): number | null {
  if (!taskIsInDoneColumn(task) || task.completedAt == null) {
    return null
  }
  const ms = task.completedAt - task.createdAt
  return ms >= 0 ? ms : null
}

type CompletedTaskSample = {
  leadTimeMs: number
  completedAtMs: number
}

function completedTaskSamples(tasks: Task[]): CompletedTaskSample[] {
  const samples: CompletedTaskSample[] = []
  for (const task of tasks) {
    if (!taskIsInDoneColumn(task) || task.completedAt == null) {
      continue
    }
    const leadTimeMs = task.completedAt - task.createdAt
    if (leadTimeMs < 0) {
      continue
    }
    samples.push({ leadTimeMs, completedAtMs: task.completedAt })
  }
  return samples
}

function arithmeticMean(values: number[]): number {
  const sum = values.reduce((total, value) => total + value, 0)
  return sum / values.length
}

function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error("median requires at least one value")
  }
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) {
    return sorted[mid]
  }
  return (sorted[mid - 1] + sorted[mid]) / 2
}

export function computeDashboardMetrics(
  tasks: Task[],
  now: number,
  options?: { trendWindowMs?: number },
): DashboardMetrics {
  const totalTasks = tasks.length
  const completedCount = tasks.filter(taskIsInDoneColumn).length
  const activeCount = tasks.filter((task) => !taskIsInDoneColumn(task)).length
  const overdueCount = tasks.filter(
    (task) =>
      task.dueDate != null &&
      task.dueDate < now &&
      !taskIsInDoneColumn(task),
  ).length

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedCount / totalTasks) * 1000) / 10

  const leadTimesMs = tasks
    .map(leadTimeMsForCompletedTask)
    .filter((ms): ms is number => ms != null)

  const averageCompletionTimeMs =
    leadTimesMs.length === 0 ? null : arithmeticMean(leadTimesMs)

  const trendWindowMs = options?.trendWindowMs ?? DEFAULT_TREND_WINDOW_MS
  const trend = completionSpeedTrend(tasks, now, trendWindowMs)

  return {
    totalTasks,
    completionPercentage,
    activeCount,
    completedCount,
    overdueCount,
    averageCompletionTimeMs,
    trend,
  }
}

function trendFromMedianLeadTimes(
  moreRecentLeads: number[],
  olderLeads: number[],
): DashboardTrend {
  const recentMedian = median(moreRecentLeads)
  const olderMedian = median(olderLeads)
  if (recentMedian < olderMedian * TREND_IMPROVING_MAX_RATIO) {
    return "improving"
  }
  if (recentMedian > olderMedian * TREND_DECLINING_MIN_RATIO) {
    return "declining"
  }
  return "stable"
}

/**
 * Prefers “this period vs last period” (equal windows). Falls back to “current vs all
 * older completions”, then “last period vs older”, then a chronological split so we never
 * dead-end on sparse data.
 */
function completionSpeedTrend(
  tasks: Task[],
  now: number,
  periodMs: number,
): DashboardTrend {
  const samples = completedTaskSamples(tasks)
  if (samples.length === 0) {
    return "none"
  }
  if (samples.length === 1) {
    return "stable"
  }

  const currentPeriodStart = now - periodMs
  const previousPeriodStart = now - 2 * periodMs

  const inCurrentPeriod = samples.filter(
    (sample) =>
      sample.completedAtMs >= currentPeriodStart && sample.completedAtMs <= now,
  )
  const inPreviousPeriod = samples.filter(
    (sample) =>
      sample.completedAtMs >= previousPeriodStart &&
      sample.completedAtMs < currentPeriodStart,
  )
  const beforeCurrentPeriod = samples.filter(
    (sample) => sample.completedAtMs < currentPeriodStart,
  )
  const beforePreviousPeriod = samples.filter(
    (sample) => sample.completedAtMs < previousPeriodStart,
  )

  if (inCurrentPeriod.length >= 1 && inPreviousPeriod.length >= 1) {
    return trendFromMedianLeadTimes(
      inCurrentPeriod.map((sample) => sample.leadTimeMs),
      inPreviousPeriod.map((sample) => sample.leadTimeMs),
    )
  }

  if (inCurrentPeriod.length >= 1 && beforeCurrentPeriod.length >= 1) {
    return trendFromMedianLeadTimes(
      inCurrentPeriod.map((sample) => sample.leadTimeMs),
      beforeCurrentPeriod.map((sample) => sample.leadTimeMs),
    )
  }

  if (inPreviousPeriod.length >= 1 && beforePreviousPeriod.length >= 1) {
    return trendFromMedianLeadTimes(
      inPreviousPeriod.map((sample) => sample.leadTimeMs),
      beforePreviousPeriod.map((sample) => sample.leadTimeMs),
    )
  }

  const byCompletion = [...samples].sort(
    (a, b) => a.completedAtMs - b.completedAtMs,
  )
  const olderCount = Math.floor(byCompletion.length / 2)
  const olderHalf = byCompletion.slice(0, olderCount)
  const newerHalf = byCompletion.slice(olderCount)
  return trendFromMedianLeadTimes(
    newerHalf.map((sample) => sample.leadTimeMs),
    olderHalf.map((sample) => sample.leadTimeMs),
  )
}
