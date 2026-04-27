import { useQueries } from '@tanstack/react-query'
import { userMe, workspaceStats, workspaceSummary } from '../lib/queryOptions'

export function WorkspaceHeader() {
  const [me, project, stats] = useQueries({
    queries: [userMe(), workspaceSummary(), workspaceStats()],
  })

  if (me.isLoading || project.isLoading || stats.isLoading) {
    return (
      <header className="workspace-header workspace-header--loading" aria-live="polite">
        <span className="task-list__loading--pulse">Loading workspace…</span>
      </header>
    )
  }
  if (me.isError || project.isError || stats.isError) {
    return (
      <header className="workspace-header workspace-header--error" role="alert">
        {me.error && <span>{(me.error as Error).message} </span>}
        {project.error && <span>{(project.error as Error).message} </span>}
        {stats.error && <span>{(stats.error as Error).message}</span>}
      </header>
    )
  }
  if (!me.data || !project.data || !stats.data) {
    return null
  }

  return (
    <header className="workspace-header">
      <div className="workspace-header__row">
        <h1 className="workspace-header__title">{project.data.name}</h1>
        <span className="workspace-header__mode" title="Data source">
          Postgres
        </span>
      </div>
      <p className="workspace-header__user">
        <strong>{me.data.displayName}</strong>
        <span aria-hidden="true"> · </span>
        {me.data.email}
      </p>
      <div
        className="workspace-header__stats"
        data-region="stats"
        aria-label="Task counts by status"
      >
        <div className="stat-chip stat-chip--open" title="Open tasks">
          <span className="stat-chip__label">Open</span>
          <span>{stats.data.open}</span>
        </div>
        <div className="stat-chip stat-chip--progress" title="In progress">
          <span className="stat-chip__label">Progress</span>
          <span>{stats.data.inProgress}</span>
        </div>
        <div className="stat-chip stat-chip--done" title="Done">
          <span className="stat-chip__label">Done</span>
          <span>{stats.data.done}</span>
        </div>
      </div>
      <p className="workspace-header__stats-footnote" title="refetchInterval on stats query">
        Live counts refresh in the background on a timer
      </p>
    </header>
  )
}
