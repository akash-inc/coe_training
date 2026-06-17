export const queryKeys = {
  me: ['me'],
  tasks: ['tasks'],
  comments: (taskId) => ['comments', taskId],
  commentsAll: ['comments'],
}
