import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { ApiErrorLogProvider } from './contexts/ApiErrorLogContext'
import { SupabaseRequired } from './components/SupabaseRequired'
import { TaskDemoGrid } from './components/TaskDemoGrid'
import { LearnHub } from './pages/LearnHub'
import { LearnSlugIndexRedirect, LearnTopicLayout } from './pages/LearnTopicLayout'
import { TaskDetailBoundary } from './features/tasks/TaskDetailBoundary'
import './App.css'

const tasksIndexPlaceholder = (
  <p className="tasks-placeholder">
    Select a task in the list to open detail, comments, and optimistic status actions
  </p>
)

function AppShell() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/learn" replace />} />
        <Route path="/learn" element={<LearnHub />} />
        <Route path="/learn/:slug" element={<LearnTopicLayout />}>
          <Route index element={<LearnSlugIndexRedirect />} />
          <Route path="tasks" element={<TaskDemoGrid />}>
            <Route index element={tasksIndexPlaceholder} />
            <Route path=":taskId" element={<TaskDetailBoundary />} />
          </Route>
        </Route>
        <Route path="*" element={<p className="not-found">Page not found</p>} />
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
