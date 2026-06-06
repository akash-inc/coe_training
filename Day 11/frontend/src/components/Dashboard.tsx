import { useMemo, useState } from 'react'
import { TaskPanel } from './TaskPanel'
import { UserPanel } from './UserPanel'
import { formatRole, hasPermission, isAdmin } from '../permissions'
import type { Dashboard, Task, TaskCounts, User } from '../types'
import './Dashboard.css'

interface DashboardProps {
  dashboard: Dashboard
  tasks: Task[]
  users: User[]
  onReload: (taskUserId: number) => Promise<void>
  onChanged: () => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

function countsFromTasks(tasks: Task[]): TaskCounts {
  const counts: TaskCounts = { total: tasks.length, open: 0, in_progress: 0, done: 0 }
  for (const task of tasks) {
    if (task.status === 'open') counts.open += 1
    else if (task.status === 'in_progress') counts.in_progress += 1
    else if (task.status === 'done') counts.done += 1
  }
  return counts
}

export function Dashboard({
  dashboard,
  tasks,
  users,
  onReload,
  onChanged,
  onError,
  onSuccess,
}: DashboardProps) {
  const { user, task_counts: ownCounts } = dashboard
  const canReadUsers = hasPermission(user.role, 'users:read')
  const [selectedUserId, setSelectedUserId] = useState(user.id)

  const selectedUser = users.find((entry) => entry.id === selectedUserId) ?? user
  const viewingOtherUser = isAdmin(user.role) && selectedUser.id !== user.id
  const displayCounts = viewingOtherUser ? countsFromTasks(tasks) : ownCounts

  async function handleSelectUser(nextUser: User) {
    setSelectedUserId(nextUser.id)
    try {
      await onReload(nextUser.id)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to load tasks')
    }
  }

  async function handleTasksChanged() {
    try {
      await onReload(selectedUser.id)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to load tasks')
    }
  }

  const taskOwner = useMemo(() => selectedUser, [selectedUser])

  return (
    <>
      <section className="dashboard-summary" aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading">Dashboard</h2>
        <p className="dashboard-welcome">
          Welcome back, {user.name}
          <span className={`role-chip role-${user.role}`}>{formatRole(user.role)}</span>
        </p>
        {viewingOtherUser && (
          <p className="dashboard-context">Viewing tasks for {selectedUser.name}</p>
        )}
        <div className="stat-grid">
          <article className="stat-card">
            <span className="stat-label">Total tasks</span>
            <strong className="stat-value">{displayCounts.total}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Open</span>
            <strong className="stat-value">{displayCounts.open}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">In progress</span>
            <strong className="stat-value">{displayCounts.in_progress}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Done</span>
            <strong className="stat-value">{displayCounts.done}</strong>
          </article>
        </div>
      </section>

      <main className="dashboard-main layout">
        {canReadUsers && (
          <UserPanel
            currentUser={user}
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={handleSelectUser}
            onChanged={onChanged}
            onError={onError}
            onSuccess={onSuccess}
          />
        )}
        <TaskPanel
          currentUser={user}
          taskOwner={taskOwner}
          tasks={tasks}
          onChanged={handleTasksChanged}
          onError={onError}
          onSuccess={onSuccess}
        />
      </main>
    </>
  )
}
