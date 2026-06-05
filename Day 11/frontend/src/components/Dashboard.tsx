import { TaskPanel } from './TaskPanel'
import type { Dashboard, Task } from '../types'
import './Dashboard.css'

interface DashboardProps {
  dashboard: Dashboard
  tasks: Task[]
  onChanged: () => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export function Dashboard({
  dashboard,
  tasks,
  onChanged,
  onError,
  onSuccess,
}: DashboardProps) {
  const { user, task_counts: counts } = dashboard

  return (
    <>
      <section className="dashboard-summary" aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading">Dashboard</h2>
        <p className="dashboard-welcome">Welcome back, {user.name}</p>
        <div className="stat-grid">
          <article className="stat-card">
            <span className="stat-label">Total tasks</span>
            <strong className="stat-value">{counts.total}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Open</span>
            <strong className="stat-value">{counts.open}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">In progress</span>
            <strong className="stat-value">{counts.in_progress}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Done</span>
            <strong className="stat-value">{counts.done}</strong>
          </article>
        </div>
      </section>

      <main className="dashboard-main">
        <TaskPanel
          currentUser={user}
          tasks={tasks}
          onChanged={onChanged}
          onError={onError}
          onSuccess={onSuccess}
        />
      </main>
    </>
  )
}
