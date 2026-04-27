import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { tasksInfinite, TASKS_PAGE_SIZE, taskDetail } from '../../lib/queryOptions'

export function TaskListInfinite() {
  const { taskId } = useParams()
  const queryClient = useQueryClient()
  const q = useInfiniteQuery(tasksInfinite(TASKS_PAGE_SIZE))

  if (q.isLoading) {
    return (
      <>
        <div className="task-list__head">
          <h2 id="task-list-heading" className="task-list__title">
            Tasks
          </h2>
        </div>
        <p className="task-list__loading task-list__loading--pulse">Loading tasks…</p>
      </>
    )
  }
  if (q.isError) {
    return (
      <>
        <div className="task-list__head">
          <h2 id="task-list-heading" className="task-list__title">
            Tasks
          </h2>
        </div>
        <p className="task-list__error" role="alert">
          {(q.error as Error).message}
        </p>
      </>
    )
  }

  const pages = q.data?.pages ?? []
  const items = pages.flatMap((p) => p.items)

  return (
    <>
      <div className="task-list__head">
        <h2 id="task-list-heading" className="task-list__title">
          Tasks
        </h2>
      </div>
      <div className="task-list__scroll">
        <ul className="task-list__ul" aria-labelledby="task-list-heading">
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
                  {t.status === 'in_progress' ? 'doing' : t.status}
                </span>
                <span className="task-list__title-text">{t.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="task-list__footer">
        {q.hasNextPage ? (
          <button
            type="button"
            className="task-list__more"
            disabled={q.isFetchingNextPage}
            onClick={() => void q.fetchNextPage()}
          >
            {q.isFetchingNextPage ? 'Loading more…' : 'Load more'}
          </button>
        ) : (
          <p className="task-list__end">You&apos;re at the end of the list</p>
        )}
      </div>
    </>
  )
}
