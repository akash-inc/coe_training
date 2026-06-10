import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTasks } from '../api/task'
import { queryKeys } from '../api/queryKeys'
import { UnauthorizedError } from '../lib/apiClient'
import TaskComments from './TaskComments'
import './TaskList.css'

export default function TaskList({ onSessionExpired, accessToken }) {
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: getTasks,
    retry: (_, err) => !(err instanceof UnauthorizedError),
  })

  useEffect(() => {
    if (error instanceof UnauthorizedError) {
      onSessionExpired()
    }
  }, [error, onSessionExpired])

  if (isLoading) {
    return (
      <section className="task-section">
        <h2 className="task-heading">Your tasks</h2>
        <div className="task-skeleton" />
        <div className="task-skeleton" />
      </section>
    )
  }

  if (isError && !(error instanceof UnauthorizedError)) {
    return <p className="task-error">{error.message}</p>
  }

  return (
    <section className="task-section">
      <div className="task-section-header">
        <h2 className="task-heading">Your tasks</h2>
        <span className="task-count">{data?.length ?? 0}</span>
      </div>

      {data?.length === 0 ? (
        <p className="task-empty">No tasks yet.</p>
      ) : (
        <ul className="task-list">
          {data?.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                className={`task-card ${selectedTaskId === task.id ? 'task-card--selected' : ''}`}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <div className="task-card-body">
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-description">{task.description}</p>
                </div>
                <span
                  className={`task-badge ${task.completed ? 'task-badge--done' : 'task-badge--open'}`}
                >
                  {task.completed ? 'Done' : 'Open'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedTaskId && accessToken && (
        <TaskComments
          taskId={selectedTaskId}
          token={accessToken}
          onSessionExpired={onSessionExpired}
        />
      )}
    </section>
  )
}
