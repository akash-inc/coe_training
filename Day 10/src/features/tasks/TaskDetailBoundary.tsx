import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { QueryErrorBoundary } from '../../components/QueryErrorBoundary'
import { taskComments, taskDetail } from '../../lib/queryOptions'
import { usePatchTask } from './usePatchTask'
import { taskKeys } from '../../lib/queryKeys'

function TaskDetailInner() {
  const { taskId = '' } = useParams()
  const tq = useQuery({
    ...taskDetail(taskId),
    throwOnError: true,
  })
  const cq = useQuery({
    ...taskComments(taskId),
    enabled: tq.isSuccess,
  })
  const patch = usePatchTask()

  if (tq.isPending) {
    return <p>Loading task…</p>
  }
  if (!tq.data) {
    return null
  }
  const task = tq.data

  return (
    <div className="task-detail">
      <h2 className="task-detail__title">{task.title}</h2>
      <p className="task-detail__meta">
        Status: <strong>{task.status.replace('_', ' ')}</strong>
        {task.assignee != null && task.assignee !== '' && (
          <>
            {' '}
            &middot; Assignee: <strong>{task.assignee}</strong>
          </>
        )}
      </p>
      <button
        type="button"
        className="task-detail__cycle"
        disabled={patch.isPending}
        onClick={() => void patch.mutateAsync(task)}
      >
        Cycle status (optimistic)
      </button>
      <section className="task-detail__comments" aria-labelledby="comments-h">
        <h3 id="comments-h">Comments {cq.isFetching ? '(updating…)' : ''}</h3>
        {cq.isPending && <p>Loading comments…</p>}
        {cq.isError && <p role="alert">{(cq.error as Error).message}</p>}
        {cq.data && (
          <ul>
            {cq.data.length === 0 ? (
              <li>No comments yet.</li>
            ) : (
              cq.data.map((c) => (
                <li key={c.id} className="task-detail__comment">
                  <time dateTime={c.createdAt}>
                    {new Date(c.createdAt).toLocaleString()}
                  </time>
                  <p>{c.body}</p>
                </li>
              ))
            )}
          </ul>
        )}
      </section>
    </div>
  )
}

export function TaskDetailBoundary() {
  const { taskId = '' } = useParams()
  const queryClient = useQueryClient()
  if (!taskId) {
    return <p className="task-detail__empty">Select a task from the list.</p>
  }
  return (
    <QueryErrorBoundary
      onReset={() => {
        void queryClient.resetQueries({ queryKey: taskKeys.detail(taskId) })
      }}
      fallback={({ error, reset }) => (
        <div className="task-detail__boundary" role="alert">
          <p>
            <strong>Detail query failed</strong> — {error.message}
          </p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </div>
      )}
    >
      <TaskDetailInner key={taskId} />
    </QueryErrorBoundary>
  )
}
