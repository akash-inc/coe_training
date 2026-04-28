import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

export type PokedexRightPanelMode = 'details' | 'battle'

export type PanelModeToggleProps = {
  value: PokedexRightPanelMode
  onChange: (v: PokedexRightPanelMode) => void
}

const MODES: PokedexRightPanelMode[] = ['details', 'battle']
const LABELS: Record<PokedexRightPanelMode, string> = { details: 'Details', battle: 'Battle' }

export function PanelModeToggle({ value, onChange }: PanelModeToggleProps) {
  return (
    <div
      className="inline-flex flex-wrap gap-0 rounded-lg border border-border bg-muted/20 p-0.5"
      role="group"
      aria-label="What the right side shows"
    >
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          className={cn(
            'relative rounded-md px-3 py-1.5 text-xs font-medium',
            value === mode ? 'text-foreground' : 'text-muted-foreground',
          )}
          onClick={() => onChange(mode)}
          aria-pressed={value === mode}
        >
          {value === mode && (
            <motion.span
              layoutId="panel-mode-indicator"
              className="absolute inset-0 rounded-md bg-card shadow-sm"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">{LABELS[mode]}</span>
        </button>
      ))}
    </div>
  )
}
