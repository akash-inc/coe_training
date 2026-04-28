import { motion, useReducedMotion } from 'framer-motion'
import { formatPokemonDisplayName } from '../../lib/pokeapi'
import { cn } from '../../lib/cn'

export type BattleSide = 'A' | 'B'

export type BattleTurnLineProps = {
  side: BattleSide
  actorName: string
  moveNameDisplay: string
  targetName: string
  damage: number
  /** Softer text for "future" turns when scrubbing. */
  dimmed?: boolean
  /** Emphasize the turn at the playhead. */
  current?: boolean
}

export function BattleTurnLine({
  side,
  actorName,
  moveNameDisplay,
  targetName,
  damage,
  dimmed,
  current,
}: BattleTurnLineProps) {
  const tag = side === 'A' ? 'A' : 'B'
  const reduced = useReducedMotion()

  return (
    <li
      className={cn(
        'relative rounded border border-transparent px-1 py-0.5',
        dimmed && 'text-foreground/40',
        !dimmed && 'text-foreground/90',
        current && 'border-border/80 bg-muted/30',
      )}
    >
      {current && !reduced && (
        <motion.span
          key={`flash-${actorName}-${damage}`}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded bg-amber-200/40"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}
      <span
        className={cn(
          'mr-1 font-mono text-[10px] text-muted-foreground',
          side === 'A' && 'text-sky-600 dark:text-sky-300',
          side === 'B' && 'text-rose-600 dark:text-rose-300',
        )}
      >
        {tag}
      </span>
      {formatPokemonDisplayName(actorName)} used{' '}
      <strong className="font-medium">{moveNameDisplay}</strong> on{' '}
      {formatPokemonDisplayName(targetName)} for {damage} damage
    </li>
  )
}
