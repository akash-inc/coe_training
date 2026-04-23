import type { PokemonSummary } from '../../lib/pokeapi'
import { cn } from '../../lib/cn'
import { IdChip } from '../atoms/IdChip'
import { PokemonName } from '../atoms/PokemonName'
import { TypeBadge } from '../atoms/TypeBadge'

type PokemonIndexGridProps = {
  items: PokemonSummary[]
  selectedId: number | null
  onSelect: (pokemon: PokemonSummary) => void
}

export function PokemonIndexGrid({
  items,
  selectedId,
  onSelect,
}: PokemonIndexGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
      {items.map((p) => {
        const selected = selectedId === p.id
        const label = `${p.name.replace(/-/g, ' ')}, number ${p.id}`
        return (
          <button
            key={p.id}
            type="button"
            className={cn(
              'flex min-w-0 cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-3 text-left [font:inherit] text-inherit transition-[border-color,box-shadow] duration-150 ease-in-out',
              'hover:border-accent-border hover:shadow-card',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              selected && 'border-accent shadow-card',
            )}
            onClick={() => onSelect(p)}
            aria-pressed={selected}
            aria-label={`Open ${label}`}
          >
            {p.spriteUrl ? (
              <img
                src={p.spriteUrl}
                alt=""
                width={72}
                height={72}
                className="h-[72px] w-[72px] shrink-0 [image-rendering:pixelated]"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className="h-[72px] w-[72px] shrink-0 rounded-sm bg-[color-mix(in_srgb,var(--border)_80%,transparent)]"
                aria-hidden
              />
            )}
            <div className="flex min-w-0 flex-col gap-1">
              <IdChip id={p.id} />
              <PokemonName
                name={p.name}
                as="span"
                className="text-[0.95rem]"
              />
              <div className="flex flex-wrap gap-1">
                {p.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
