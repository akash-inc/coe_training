import { useQueries } from '@tanstack/react-query'
import { userMe, workspaceStats, workspaceSummary } from '../lib/queryOptions'

export function WorkspaceHeader() {
  const [me, project, stats] = useQueries({
    queries: [userMe(), workspaceSummary(), workspaceStats()],
  })

  if (me.isLoading || project.isLoading || stats.isLoading) {
    return (
      <header className="workspace-header workspace-header--loading" aria-live="polite">
        Loading workspace…
      </header>
    )
  }
  if (me.isError || project.isError || stats.isError) {
    return (
      <header className="workspace-header workspace-header--error" role="alert">
        {me.error && <span>{(me.error as Error).message}</span>}
        {project.error && <span>{(project.error as Error).message}</span>}
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
          Postgres (Supabase)
        </span>
      </div>
      <p className="workspace-header__user">
        Signed in as <strong>{me.data.displayName}</strong> &middot; {me.data.email}
      </p>
      <p className="workspace-header__stats" aria-label="Task counts by status">
        <span>open {stats.data.open}</span>
        <span>in progress {stats.data.inProgress}</span>
        <span>done {stats.data.done}</span>
        <span className="workspace-header__stats-note" title="refetchInterval on this query">
          (stats refetch in background on an interval for demos)
        </span>
      </p>
    </header>
  )
}
