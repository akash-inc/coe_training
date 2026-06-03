import { useCallback, useEffect, useState } from 'react'
import { fetchTasks, fetchUsers } from './api'
import { TaskPanel } from './components/TaskPanel'
import { Toast } from './components/Toast'
import { UserPanel } from './components/UserPanel'
import type { Task, User } from './types'
import './App.css'

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ message: '', isError: false })

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError })
    window.setTimeout(() => setToast({ message: '', isError: false }), 4000)
  }, [])

  const loadData = useCallback(async () => {
    const [usersData, tasksData] = await Promise.all([fetchUsers(), fetchTasks()])
    setUsers(usersData)
    setTasks(tasksData)
  }, [])

  useEffect(() => {
    loadData()
      .catch((error) =>
        showToast(error instanceof Error ? error.message : 'Failed to load data', true),
      )
      .finally(() => setLoading(false))
  }, [loadData, showToast])

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <h1>Task Manager</h1>
          <p className="tagline">Day 11 — FastAPI + Vite React</p>
        </div>
        <nav className="header-nav">
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer">
            API docs
          </a>
          <a href="/health" target="_blank" rel="noopener noreferrer">
            Health
          </a>
        </nav>
      </header>

      <Toast message={toast.message} isError={toast.isError} />

      {loading ? (
        <p className="loading">Loading…</p>
      ) : (
        <main className="layout">
          <UserPanel
            users={users}
            onCreated={loadData}
            onError={(message) => showToast(message, true)}
          />
          <TaskPanel
            users={users}
            tasks={tasks}
            onChanged={loadData}
            onError={(message) => showToast(message, true)}
            onSuccess={showToast}
          />
        </main>
      )}
    </>
  )
}

export default App
