import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createComment, getComments } from '../api/comments'
import { queryKeys } from '../api/queryKeys'
import {
  createOptimisticComment,
  mergeComments,
  replaceOptimisticComment,
} from '../lib/commentsCache'
import { useTaskCommentsSocket } from '../hooks/useTaskCommentsSocket'
import './TaskComments.css'

function connectionLabel(status) {
  if (status === 'open') return 'Live'
  if (status === 'connecting' || status === 'reconnecting') return 'Reconnecting…'
  return 'Offline'
}

export default function TaskComments({ taskId, token, userEmail, onSessionExpired }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState('')

  const commentsQueryKey = queryKeys.comments(taskId)

  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: commentsQueryKey,
    queryFn: () => getComments(taskId),
    enabled: !!taskId && !!token,
  })

  const { mutate: postComment, isPending, error: postError } = useMutation({
    mutationFn: (body) => createComment(taskId, body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: commentsQueryKey })

      const previousComments = queryClient.getQueryData(commentsQueryKey) ?? []
      const optimisticComment = createOptimisticComment({
        taskId,
        body,
        authorEmail: userEmail ?? 'you',
      })

      queryClient.setQueryData(commentsQueryKey, (existing = []) =>
        mergeComments(existing, [optimisticComment]),
      )

      return { previousComments, optimisticId: optimisticComment.id }
    },
    onError: (_error, _body, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(commentsQueryKey, context.previousComments)
      }
    },
    onSuccess: (confirmedComment, _body, context) => {
      if (!context?.optimisticId) return

      queryClient.setQueryData(commentsQueryKey, (existing = []) =>
        replaceOptimisticComment(existing, context.optimisticId, confirmedComment),
      )
    },
  })

  const handleCommentCreated = useCallback(
    (comment) => {
      queryClient.setQueryData(commentsQueryKey, (existing = []) => {
        const hasOptimisticMatch = existing.some(
          (item) =>
            item.optimistic &&
            item.body === comment.body &&
            item.author_email === comment.author_email,
        )

        if (hasOptimisticMatch) {
          const withoutMatchingOptimistic = existing.filter(
            (item) =>
              !(
                item.optimistic &&
                item.body === comment.body &&
                item.author_email === comment.author_email
              ),
          )
          return mergeComments(withoutMatchingOptimistic, [comment])
        }

        return mergeComments(existing, [comment])
      })
    },
    [queryClient, commentsQueryKey],
  )

  const handleCommentsSnapshot = useCallback(
    (snapshotComments) => {
      queryClient.setQueryData(commentsQueryKey, (existing = []) =>
        mergeComments(existing, snapshotComments),
      )
    },
    [queryClient, commentsQueryKey],
  )

  const handleSocketError = useCallback((message) => {
    console.error('WebSocket error:', message)
  }, [])

  const handleAuthError = useCallback(() => {
    onSessionExpired()
  }, [onSessionExpired])

  const { status } = useTaskCommentsSocket(taskId, token, {
    onCommentCreated: handleCommentCreated,
    onCommentsSnapshot: handleCommentsSnapshot,
    onSocketError: handleSocketError,
    onAuthError: handleAuthError,
  })

  function handleSubmit(event) {
    event.preventDefault()

    const body = draft.trim()
    if (!body || isPending) return

    postComment(body, {
      onSuccess: () => setDraft(''),
    })
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
            <li
              key={comment.id}
              className={`task-comment ${comment.optimistic ? 'task-comment--optimistic' : ''}`}
            >
              <p className="task-comment-body">{comment.body}</p>
              <p className="task-comment-meta">
                {comment.author_email}
                {' · '}
                {comment.optimistic ? 'Sending…' : new Date(comment.created_at).toLocaleString()}
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
          disabled={isPending}
        />
        {postError && <p className="task-comments-error">{postError.message}</p>}
        <button
          type="submit"
          className="task-comments-submit"
          disabled={!draft.trim() || isPending}
        >
          {isPending ? 'Posting…' : 'Post comment'}
        </button>
      </form>
    </section>
  )
}
