import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getComments } from '../api/comments'
import { queryKeys } from '../api/queryKeys'
import { useTaskCommentsSocket } from '../hooks/useTaskCommentsSocket'
import './TaskComments.css'

function connectionLabel(status) {
  if (status === 'open') return 'Live'
  if (status === 'connecting' || status === 'reconnecting') return 'Reconnecting…'
  return 'Offline'
}

function mergeComments(existing = [], incoming = []) {
  const byId = new Map(existing.map((comment) => [comment.id, comment]))
  for (const comment of incoming) {
    byId.set(comment.id, comment)
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
}

export default function TaskComments({ taskId, token, onSessionExpired }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState(null)
  const [socketError, setSocketError] = useState(null)

  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: queryKeys.comments(taskId),
    queryFn: () => getComments(taskId),
    enabled: !!taskId && !!token,
  })

  const handleCommentCreated = useCallback(
    (comment) => {
      queryClient.setQueryData(queryKeys.comments(taskId), (existing = []) =>
        mergeComments(existing, [comment]),
      )
    },
    [queryClient, taskId],
  )

  const handleCommentsSnapshot = useCallback(
    (snapshotComments) => {
      queryClient.setQueryData(queryKeys.comments(taskId), (existing = []) =>
        mergeComments(existing, snapshotComments),
      )
    },
    [queryClient, taskId],
  )

  const handleSocketError = useCallback((message) => {
    setSocketError(message)
  }, [])

  const handleAuthError = useCallback(() => {
    onSessionExpired()
  }, [onSessionExpired])

  const { sendComment, status } = useTaskCommentsSocket(taskId, token, {
    onCommentCreated: handleCommentCreated,
    onCommentsSnapshot: handleCommentsSnapshot,
    onSocketError: handleSocketError,
    onAuthError: handleAuthError,
  })

  function handleSubmit(event) {
    event.preventDefault()
    setSendError(null)
    setSocketError(null)

    const body = draft.trim()
    if (!body) return

    const sent = sendComment(body)
    if (!sent) {
      setSendError('Not connected. Wait for live updates to resume.')
      return
    }

    setDraft('')
  }

  if (isLoading) {
    return <p className="task-comments-loading">Loading comments…</p>
  }

  if (error) {
    return <p className="task-comments-error">{error.message}</p>
  }

  return (
    <section className="task-comments" aria-label="Task comments">
      <div className="task-comments-header">
        <h3 className="task-comments-title">Comments</h3>
        <span className={`task-comments-status task-comments-status--${status}`}>
          {connectionLabel(status)}
        </span>
      </div>

      {comments.length === 0 ? (
        <p className="task-comments-empty">No comments yet.</p>
      ) : (
        <ul className="task-comments-list">
          {comments.map((comment) => (
            <li key={comment.id} className="task-comment">
              <p className="task-comment-body">{comment.body}</p>
              <p className="task-comment-meta">
                {comment.author_email}
                {' · '}
                {new Date(comment.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form className="task-comments-form" onSubmit={handleSubmit}>
        <label className="task-comments-label" htmlFor={`comment-input-${taskId}`}>
          Add a comment
        </label>
        <textarea
          id={`comment-input-${taskId}`}
          className="task-comments-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Write a comment…"
        />
        {sendError && <p className="task-comments-error">{sendError}</p>}
        {socketError && <p className="task-comments-error">{socketError}</p>}
        <button
          type="submit"
          className="task-comments-submit"
          disabled={!draft.trim() || status !== 'open'}
        >
          Post comment
        </button>
      </form>
    </section>
  )
}
