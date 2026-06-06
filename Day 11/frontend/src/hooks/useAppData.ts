import { useCallback, useState } from 'react'
import { fetchDashboard, fetchTasks, fetchUsers } from '../api'
import { hasPermission, isAdmin } from '../permissions'
import type { Dashboard, Task, User } from '../types'

export function useAppData() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])

  const loadData = useCallback(async (taskUserId?: number) => {
    const dashboardData = await fetchDashboard()
    setDashboard(dashboardData)

    const effectiveUserId = taskUserId ?? dashboardData.user.id
    setTasks(
      await fetchTasks(isAdmin(dashboardData.user.role) ? effectiveUserId : undefined),
    )

    setUsers(
      hasPermission(dashboardData.user.role, 'users:read') ? await fetchUsers() : [],
    )
  }, [])

  const reloadTasksForUser = useCallback(
    async (taskUserId: number) => {
      if (!dashboard) return

      setTasks(await fetchTasks(isAdmin(dashboard.user.role) ? taskUserId : undefined))
      if (taskUserId === dashboard.user.id) {
        setDashboard(await fetchDashboard())
      }
    },
    [dashboard],
  )

  const clearData = useCallback(() => {
    setDashboard(null)
    setTasks([])
    setUsers([])
  }, [])

  return { dashboard, tasks, users, loadData, reloadTasksForUser, clearData }
}
