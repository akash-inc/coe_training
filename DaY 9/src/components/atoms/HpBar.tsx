import { motion, useReducedMotion } from 'framer-motion'
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
  const reduced = useReducedMotion()
  const critical = pct <= 20

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
      <motion.div
        className={cn(
          'h-full rounded-full',
          pct > 50 ? 'bg-emerald-500/90' : pct > 20 ? 'bg-amber-500/90' : 'bg-rose-500/90',
        )}
        animate={
          critical && !reduced
            ? { width: `${pct}%`, opacity: [1, 0.55, 1] }
            : { width: `${pct}%`, opacity: 1 }
        }
        transition={
          reduced
            ? { duration: 0 }
            : critical
              ? {
                  width: { duration: 0.5, ease: 'easeOut' },
                  opacity: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
                }
              : { duration: 0.5, ease: 'easeOut' }
        }
      />
    </div>
  )
}
