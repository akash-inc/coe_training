import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { tasksInfinite, TASKS_PAGE_SIZE, taskDetail } from '../../lib/queryOptions'

export function TaskListInfinite() {
  const { taskId } = useParams()
  const queryClient = useQueryClient()
  const q = useInfiniteQuery(tasksInfinite(TASKS_PAGE_SIZE))

  if (q.isLoading) {
    return <p className="task-list__loading">Loading tasks…</p>
  }
  if (q.isError) {
    return <p role="alert">{(q.error as Error).message}</p>
  }

  const pages = q.data?.pages ?? []
  const items = pages.flatMap((p) => p.items)

  return (
    <section className="task-list" aria-labelledby="task-list-heading">
      <h2 id="task-list-heading" className="task-list__title">
        Tasks
      </h2>
      <ul className="task-list__ul">
        {items.map((t) => (
          <li key={t.id}>
            <Link
              className={`task-list__link${taskId === t.id ? ' task-list__link--active' : ''}`}
              to={`/tasks/${t.id}`}
              onMouseEnter={() => {
                void queryClient.prefetchQuery(taskDetail(t.id))
              }}
            >
              <span className="task-list__status" data-status={t.status}>
                {t.status.replace('_', ' ')}
              </span>
              <span className="task-list__title-text">{t.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      {q.hasNextPage ? (
        <button
          type="button"
          className="task-list__more"
          disabled={q.isFetchingNextPage}
          onClick={() => void q.fetchNextPage()}
        >
          {q.isFetchingNextPage ? 'Loading…' : 'Load more'}
        </button>
      ) : (
        <p className="task-list__end">End of list</p>
      )}
    </section>
  )
}
