import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Switch } from '@headlessui/react'
import type { ColorMode, VisualStyle } from '../../lib/themeStorage'
import { cn } from '../../lib/cn'

const selectBtn = cn(
  'inline-flex w-full min-w-[10rem] items-center justify-between gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left text-sm text-foreground',
  'focus:outline-none focus:ring-2 focus:ring-accent/40',
)
const listPanel = cn(
  'z-50 mt-1 min-w-[10rem] rounded-md border border-border bg-card py-1 shadow-card',
)
const listOpt = (focus: boolean) =>
  cn('cursor-default px-2 py-1.5 text-sm', focus && 'bg-accent-bg/30')

const modeLabels: Record<ColorMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'Match system',
}

type ThemeControlsProps = {
  colorMode: ColorMode
  onColorModeChange: (m: ColorMode) => void
  visualStyle: VisualStyle
  onVisualStyleChange: (v: VisualStyle) => void
  resolved: 'light' | 'dark'
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
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
      data-slot="theme-controls"
    >
      <Listbox value={colorMode} onChange={onColorModeChange}>
        <div className="w-full min-w-0 sm:w-auto">
          <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Color
          </span>
          <ListboxButton className={selectBtn} aria-label="Color theme">
            <span>{modeLabels[colorMode]}</span>
            <span aria-hidden className="text-muted-foreground">▾</span>
          </ListboxButton>
          <ListboxOptions anchor="bottom end" className={listPanel} modal={false} transition>
            {(['light', 'dark', 'system'] as const).map((m) => (
              <ListboxOption
                key={m}
                value={m}
                className={({ focus }) => listOpt(!!focus)}
              >
                {modeLabels[m]}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
      {colorMode === 'system' ? (
        <p className="m-0 text-[10px] text-muted-foreground sm:self-end sm:pt-3">
          Using: {resolved === 'dark' ? 'dark' : 'light'}
        </p>
      ) : null}
      <div className="flex items-center gap-2 sm:ml-1 sm:pt-3">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Vivid</span>
        <Switch
          checked={visualStyle === 'colorful'}
          onChange={(c) => onVisualStyleChange(c ? 'colorful' : 'default')}
          className="group inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border bg-border/40 transition data-[checked]:border-accent/50 data-[checked]:bg-accent-bg/40"
        >
          <span
            className="ms-0.5 inline-block h-4 w-4 translate-x-0 rounded-full bg-background shadow transition group-data-[checked]:translate-x-5"
            aria-hidden
          />
        </Switch>
      </div>
    </div>
  )
}
