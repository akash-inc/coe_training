import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { ApiErrorLogProvider } from './contexts/ApiErrorLogContext'
import { SupabaseRequired } from './components/SupabaseRequired'
import { GlobalErrorBanner } from './components/GlobalErrorBanner'
import { WorkspaceHeader } from './components/WorkspaceHeader'
import { CreateTaskForm } from './components/CreateTaskForm'
import { CacheToolsPanel } from './components/CacheToolsPanel'
import { TaskListInfinite } from './features/tasks/TaskListInfinite'
import { TaskDetailBoundary } from './features/tasks/TaskDetailBoundary'
import './App.css'

function TasksLayout() {
  return (
    <div className="app-grid">
      <div className="app-grid__main">
        <CreateTaskForm />
        <div className="app-grid__split">
          <TaskListInfinite />
          <div className="app-grid__detail">
            <Outlet />
          </div>
        </div>
      </div>
      <CacheToolsPanel />
    </div>
  )
}

function AppShell() {
  return (
    <div className="app">
      <GlobalErrorBanner />
      <WorkspaceHeader />
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="tasks" element={<TasksLayout />}>
          <Route index element={<p className="tasks-placeholder">Select a task to view details and comments.</p>} />
          <Route path=":taskId" element={<TaskDetailBoundary />} />
        </Route>
        <Route path="*" element={<p className="not-found">Not found</p>} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiErrorLogProvider>
        <SupabaseRequired>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </SupabaseRequired>
      </ApiErrorLogProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
