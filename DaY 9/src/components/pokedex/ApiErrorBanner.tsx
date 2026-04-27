import { useApiErrorLog } from '../../hooks/useApiErrorLog'
import { cn } from '../../lib/cn'

export function ApiErrorBanner() {
  const { entries, clear } = useApiErrorLog()
  if (entries.length === 0) {
    return null
  }
  const latest = entries[0]
  return (
    <div
      className="border-b border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-foreground"
      role="status"
    >
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-2">
        <p className="m-0 min-w-0 break-words">
          <span className="text-muted-foreground">Last API error{latest.label ? ` · ${latest.label}` : ''}:</span>{' '}
          {latest.message}
        </p>
        <button
          type="button"
          className={cn('shrink-0 rounded border border-border/80 px-2 py-0.5', 'text-foreground')}
          onClick={clear}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
