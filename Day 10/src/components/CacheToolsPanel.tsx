import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import type { TaskPage } from '../api/schemas'
import { getWorkspaceId } from '../api/unified'
import { taskKeys } from '../lib/queryKeys'
import { TASKS_PAGE_SIZE, tasksInfinite } from '../lib/queryOptions'
import { setSimulateWriteFailure, getSimulateWriteFailure } from '../lib/simulateWriteFailure'
import { useState } from 'react'

export function CacheToolsPanel() {
  const qc = useQueryClient()
  const ws = getWorkspaceId()
  const [simFail, setSimFail] = useState(getSimulateWriteFailure)

  return (
    <aside className="cache-tools" aria-labelledby="cache-tools-h">
      <div className="cache-tools__head">
        <h2 id="cache-tools-h" className="cache-tools__title">
          Cache &amp; debug
        </h2>
        <p className="cache-tools__hint">
          React Query levers: invalidate, reset, and manual <code>setQueryData</code> for side‑by‑side comparison.
        </p>
      </div>
      <ul className="cache-tools__actions">
        <li>
          <button
            type="button"
            onClick={() => {
              void qc.invalidateQueries({ queryKey: taskKeys.all() })
            }}
          >
            Invalidate <code>tasks</code> prefix
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              void qc.invalidateQueries({
                predicate: (q) =>
                  Array.isArray(q.queryKey) &&
                  q.queryKey[0] === 'tasks' &&
                  q.queryKey[1] === ws,
              })
            }}
          >
            Predicate: this workspace
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              void qc.resetQueries({ queryKey: taskKeys.infinite(TASKS_PAGE_SIZE) })
            }}
          >
            Reset infinite list
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              const options = tasksInfinite(TASKS_PAGE_SIZE)
              const key = options.queryKey
              const cur = qc.getQueryData<InfiniteData<TaskPage>>(key)
              if (!cur?.pages[0]?.items[0]) {
                return
              }
              const patched: InfiniteData<TaskPage> = {
                pageParams: cur.pageParams,
                pages: cur.pages.map((p, i) =>
                  i === 0
                    ? {
                        ...p,
                        items: p.items.map((it, j) =>
                          j === 0 ? { ...it, title: `${it.title} (touched in cache)` } : it,
                        ),
                      }
                    : p,
                ),
              }
              qc.setQueryData(key, patched)
            }}
          >
            <code>setQueryData</code> first title
          </button>
        </li>
        <li>
          <label className="cache-tools__check">
            <input
              type="checkbox"
              checked={simFail}
              onChange={(e) => {
                setSimulateWriteFailure(e.target.checked)
                setSimFail(e.target.checked)
              }}
            />
            Fail writes while enabled
          </label>
        </li>
      </ul>
      <div className="cache-tools__footer">
        <button
          type="button"
          className="cache-tools__link-btn"
          onClick={() => {
            const id = getWorkspaceId()
            void qc.invalidateQueries({
              predicate: (q) =>
                Array.isArray(q.queryKey) &&
                q.queryKey[0] === 'workspace' &&
                q.queryKey[1] === 'stats' &&
                q.queryKey[2] === id,
            })
          }}
        >
          Invalidate workspace stats
        </button>
        <p className="cache-tools__devtools-note">
          In React Query Devtools, select the query whose key is{' '}
          <code>workspace</code> → <code>stats</code> → your workspace id. After this
          click, that entry refetches: <code>fetchStatus</code> shows <code>fetching</code>{' '}
          briefly, then <code>idle</code>; <code>dataUpdatedAt</code> and the cached counts
          update if the server changed. Queries under <code>tasks</code> are not part of
          this invalidation.
        </p>
      </div>
    </aside>
  )
}
