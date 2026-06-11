export function mergeComments(existing = [], incoming = []) {
  const byId = new Map(existing.map((comment) => [comment.id, comment]))
  for (const comment of incoming) {
    byId.set(comment.id, comment)
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
}

export function createOptimisticComment({ taskId, body, authorEmail }) {
  return {
    id: `temp-${crypto.randomUUID()}`,
    task_id: taskId,
    body,
    author_email: authorEmail,
    created_at: new Date().toISOString(),
    optimistic: true,
  }
}

export function replaceOptimisticComment(existing = [], optimisticId, confirmedComment) {
  const withoutOptimistic = existing.filter((comment) => comment.id !== optimisticId)
  return mergeComments(withoutOptimistic, [confirmedComment])
}

export function removeCommentById(existing = [], commentId) {
  return existing.filter((comment) => comment.id !== commentId)
}

export function updateCommentInList(existing = [], updatedComment) {
  return existing
    .map((comment) => (comment.id === updatedComment.id ? updatedComment : comment))
    .sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
}
