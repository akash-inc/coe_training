import { cn } from '../../lib/cn'

export type HpBarProps = {
  current: number
  max: number
  /** Thinner bar for compact lists. */
  tiny?: boolean
  className?: string
}

export function HpBar({ current, max, tiny, className }: HpBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((100 * current) / max))
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-border/50', tiny && 'h-1', className)}
      title={`${current} / ${max} HP`}
      role="meter"
      aria-label={`${current} of ${max} hit points`}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width]',
          pct > 50 ? 'bg-emerald-500/90' : pct > 20 ? 'bg-amber-500/90' : 'bg-rose-500/90',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
