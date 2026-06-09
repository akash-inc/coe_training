import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTasks } from '../api/task'
import { queryKeys } from '../api/queryKeys'
import { UnauthorizedError } from '../lib/apiClient'

export default function TaskList({ onSessionExpired }) {
  const { data, isError, error } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: getTasks,
    retry: (_, err) => !(err instanceof UnauthorizedError),
  })

  useEffect(() => {
    if (error instanceof UnauthorizedError) {
      onSessionExpired()
    }
  }, [error, onSessionExpired])

  if (isError && !(error instanceof UnauthorizedError)) {
    return <p className="error">{error.message}</p>
  }

  return (
    <ul>
      {data?.map((task) => (
        <li key={task.id}>
          {task.title} — {task.description} ({task.completed ? 'Completed' : 'Not completed'})
        </li>
      ))}
    </ul>
  )
}
