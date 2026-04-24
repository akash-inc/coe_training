import type { ColorMode, VisualStyle } from '../../lib/themeStorage'
import { cn } from '../../lib/cn'
import { IconMonitor, IconMoon, IconSparkle, IconSun } from '../atoms/themeIcons'

type ThemeControlsProps = {
  colorMode: ColorMode
  onColorModeChange: (m: ColorMode) => void
  visualStyle: VisualStyle
  onVisualStyleChange: (v: VisualStyle) => void
  resolved: 'light' | 'dark'
}

const modes = [
  { id: 'light' as const, label: 'Light', short: 'Lt', Icon: IconSun },
  { id: 'dark' as const, label: 'Dark', short: 'Dk', Icon: IconMoon },
  { id: 'system' as const, label: 'Auto', short: 'Sys', Icon: IconMonitor },
] as const

function chipClass(active: boolean) {
  return cn(
    'inline-flex h-8 shrink-0 items-center justify-center gap-0.5 rounded border px-1.5 text-[11px] font-medium sm:gap-1 sm:px-2 sm:text-xs',
    'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
    active
      ? 'border-accent bg-accent-bg text-foreground'
      : 'border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground',
  )
}

export function ThemeControls({
  colorMode,
  onColorModeChange,
  visualStyle,
  onVisualStyleChange,
  resolved,
}: ThemeControlsProps) {
  return (
    <div
      className="flex w-full min-w-0 flex-wrap items-center justify-start gap-2 sm:min-w-0 sm:justify-end sm:gap-3"
      data-slot="theme-controls"
    >
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <span className="w-7 shrink-0 text-[9px] font-semibold uppercase leading-tight text-muted-foreground sm:w-auto sm:text-[10px]">
          Color
        </span>
        <div
          className="inline-flex min-w-0 rounded-lg border border-border/40 bg-background p-0.5"
          role="group"
          aria-label="Color theme"
        >
          {modes.map(({ id, label, short, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={colorMode === id}
              title={id === 'system' ? 'Match system' : label}
              onClick={() => onColorModeChange(id)}
              className={cn(chipClass(colorMode === id))}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
              <span className="hidden min-[400px]:inline">{label}</span>
              <span className="min-[400px]:hidden">{short}</span>
            </button>
          ))}
        </div>
        {colorMode === 'system' ? (
          <span
            className="hidden text-[10px] capitalize text-muted-foreground sm:inline"
            title="Resolved color scheme"
          >
            ({resolved})
          </span>
        ) : null}
      </div>

      <div
        className="hidden h-5 w-px shrink-0 bg-border/60 sm:block"
        aria-hidden
      />

      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <span className="w-7 shrink-0 text-[9px] font-semibold uppercase leading-tight text-muted-foreground sm:w-auto sm:text-[10px]">
          Style
        </span>
        <div
          className="inline-flex min-w-0 rounded-lg border border-border/40 bg-background p-0.5"
          role="group"
          aria-label="Visual style"
        >
          <button
            type="button"
            aria-pressed={visualStyle === 'default'}
            onClick={() => onVisualStyleChange('default')}
            className={cn(
              chipClass(visualStyle === 'default'),
              'px-2 sm:px-3',
            )}
          >
            Calm
          </button>
          <button
            type="button"
            aria-pressed={visualStyle === 'colorful'}
            onClick={() => onVisualStyleChange('colorful')}
            className={cn(
              chipClass(visualStyle === 'colorful'),
              'gap-0.5 px-2 sm:gap-1 sm:px-3',
            )}
          >
            <IconSparkle className="h-3.5 w-3.5" aria-hidden />
            Vivid
          </button>
        </div>
      </div>
    </div>
  )
}
