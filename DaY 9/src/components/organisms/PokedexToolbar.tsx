import {
  Button,
  Checkbox,
  Field,
  Fieldset,
  Input,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react'
import { cn } from '../../lib/cn'
import type { PokedexSort } from '../../hooks/usePokedexFilter'

type PokedexToolbarProps = {
  query: string
  onQueryChange: (q: string) => void
  sort: PokedexSort
  onSortChange: (s: PokedexSort) => void
  availableTypes: string[]
  selectedTypes: Set<string>
  onToggleType: (t: string) => void
  onClearFilters: () => void
  visibleCount: number
  totalCount: number
  /** When set, shows total species in the national dex (from the list API). */
  nationalTotalCount: number
  hasActiveFilters: boolean
}

const control = cn(
  'rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground',
  'focus:outline-none focus:ring-2 focus:ring-accent/50',
)

const listPanel = cn(
  'z-20 mt-1 min-w-[12rem] rounded-md border border-border bg-card py-1 shadow-card',
  'focus:outline-none',
)

export function PokedexToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  availableTypes,
  selectedTypes,
  onToggleType,
  onClearFilters,
  visibleCount,
  totalCount,
  nationalTotalCount,
  hasActiveFilters,
}: PokedexToolbarProps) {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-3 rounded-lg border border-border/60 bg-card/30 p-3"
      data-slot="pokedex-toolbar"
    >
      <div className="flex flex-col gap-2 min-[500px]:flex-row min-[500px]:flex-wrap min-[500px]:items-end min-[500px]:gap-3">
        <Field className="min-w-0 flex-1">
          <Label className="mb-0.5 block text-xs font-medium text-muted-foreground">
            Search name
          </Label>
          <Input
            className={cn('block w-full', control)}
            value={query}
            placeholder="e.g. pika, char…"
            onChange={(e) => onQueryChange(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
        <Field className="w-full min-[500px]:w-48">
          <Label className="mb-0.5 block text-xs font-medium text-muted-foreground">Sort by</Label>
          <Listbox
            value={sort}
            onChange={(s) => onSortChange(s as PokedexSort)}
          >
            <ListboxButton
              className={cn('flex w-full items-center justify-between gap-1 text-left', control)}
            >
              <span>
                {sort === 'id' ? 'National # (low → high)' : 'Name (A–Z)'}
              </span>
              <span aria-hidden className="text-muted-foreground">▾</span>
            </ListboxButton>
            <ListboxOptions transition anchor="bottom start" className={listPanel} modal={false}>
              <ListboxOption
                value="id"
                className={({ focus, selected }) =>
                  cn(
                    'cursor-default text-sm text-foreground',
                    focus && 'bg-accent-bg/20',
                    selected && 'font-medium',
                  )
                }
              >
                National # (low → high)
              </ListboxOption>
              <ListboxOption
                value="name"
                className={({ focus, selected }) =>
                  cn(
                    'cursor-default text-sm text-foreground',
                    focus && 'bg-accent-bg/20',
                    selected && 'font-medium',
                  )
                }
              >
                Name (A–Z)
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
        </Field>
      </div>

      <div className="text-xs text-muted-foreground" aria-live="polite">
        Showing {visibleCount} of {totalCount} loaded · national {nationalTotalCount.toLocaleString()}{' '}
        species
        {hasActiveFilters ? ' · filters on' : ''}
      </div>

      {availableTypes.length > 0 ? (
        <Fieldset>
          <legend className="text-xs font-medium text-muted-foreground">
            Types — match <strong className="text-foreground/90">all</strong> selected
          </legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {availableTypes.map((t) => (
              <Checkbox
                key={t}
                checked={selectedTypes.has(t)}
                onChange={() => onToggleType(t)}
                className="group"
              >
                {({ checked }) => (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-2 py-1 text-xs capitalize transition-colors',
                      checked
                        ? 'border-accent text-foreground'
                        : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-2 w-2 shrink-0 rounded-sm border',
                        checked ? 'border-accent bg-accent' : 'border-border',
                      )}
                      aria-hidden
                    />
                    {t}
                  </span>
                )}
              </Checkbox>
            ))}
          </div>
        </Fieldset>
      ) : null}

      {hasActiveFilters ? (
        <Button
          type="button"
          className="self-start rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
          onClick={onClearFilters}
        >
          Clear search & type filters
        </Button>
      ) : null}
    </div>
  )
}
