import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import type { Task, TaskPage } from '../../api/schemas'
import { cycleStatus, patchTaskRemote, taskDetail, TASKS_PAGE_SIZE, tasksInfinite } from '../../lib/queryOptions'
import { getWorkspaceId } from '../../api/unified'
import { taskKeys, workspaceKeys } from '../../lib/queryKeys'

type Ctx = {
  taskId: string
  previousDetail: Task | undefined
  previousInfinite: [readonly unknown[], InfiniteData<TaskPage> | undefined][]
}

export function usePatchTask() {
  const queryClient = useQueryClient()
  const w = getWorkspaceId()
  return useMutation({
    mutationFn: async (task: Task) => {
      return patchTaskRemote(task.id, { status: cycleStatus(task.status) })
    },
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all(w) })
      const previousDetail = queryClient.getQueryData<Task>(taskKeys.detail(task.id, w))
      const previousInfinite = queryClient.getQueriesData<InfiniteData<TaskPage>>({
        queryKey: taskKeys.infinite(TASKS_PAGE_SIZE, w),
      })
      const next: Task = {
        ...task,
        status: cycleStatus(task.status),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueryData(taskKeys.detail(task.id, w), next)
      for (const [key] of previousInfinite) {
        queryClient.setQueryData<InfiniteData<TaskPage>>(key, (old) => {
          if (!old) {
            return old
          }
          return {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              items: p.items.map((i) => (i.id === task.id ? next : i)),
            })),
          }
        })
      }
      return { taskId: task.id, previousDetail, previousInfinite } satisfies Ctx
    },
    onError: (_err, _task, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(taskKeys.detail(context.taskId, w), context.previousDetail)
      }
      if (context?.previousInfinite) {
        for (const [key, data] of context.previousInfinite) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all(w) })
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.stats(w) })
    },
  })
}

export { taskDetail, tasksInfinite, TASKS_PAGE_SIZE }
