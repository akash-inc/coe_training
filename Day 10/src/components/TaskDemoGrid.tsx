import { Outlet } from 'react-router-dom'
import { CreateTaskForm } from './CreateTaskForm'
import { TaskListInfinite } from '../features/tasks/TaskListInfinite'
import { CacheToolsPanel } from './CacheToolsPanel'

export function TaskDemoGrid() {
  return (
    <div className="app-grid">
      <div className="app-grid__main">
        <div className="create-task__wrap panel" data-region="form">
          <CreateTaskForm />
        </div>
        <div className="app-grid__split">
          <div className="task-list panel" data-region="list">
            <TaskListInfinite />
          </div>
          <div className="app-grid__detail panel panel--pad" data-region="detail">
            <Outlet />
          </div>
        </div>
      </div>
      <div data-region="cache">
        <CacheToolsPanel />
      </div>
    </div>
  )
}
