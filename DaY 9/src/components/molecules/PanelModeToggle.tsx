import { cn } from '../../lib/cn'

export type PokedexRightPanelMode = 'details' | 'battle'

export type PanelModeToggleProps = {
  value: PokedexRightPanelMode
  onChange: (v: PokedexRightPanelMode) => void
}

export function PanelModeToggle({ value, onChange }: PanelModeToggleProps) {
  return (
    <div
      className="inline-flex flex-wrap gap-0 rounded-lg border border-border bg-muted/20 p-0.5"
      role="group"
      aria-label="What the right side shows"
    >
      <button
        type="button"
        className={cn(
          'rounded-md px-3 py-1.5 text-xs font-medium',
          value === 'details' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
        )}
        onClick={() => onChange('details')}
        aria-pressed={value === 'details'}
      >
        Details
      </button>
      <button
        type="button"
        className={cn(
          'rounded-md px-3 py-1.5 text-xs font-medium',
          value === 'battle' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
        )}
        onClick={() => onChange('battle')}
        aria-pressed={value === 'battle'}
      >
        Battle
      </button>
    </div>
  )
}
