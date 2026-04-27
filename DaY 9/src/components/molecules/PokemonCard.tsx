import type { PokemonSummary } from '../../lib/pokeapi'
import { cn } from '../../lib/cn'
import { IdChip } from '../atoms/IdChip'
import { PokemonName } from '../atoms/PokemonName'
import { TypeBadge } from '../atoms/TypeBadge'

type PokemonCardProps = {
  pokemon: PokemonSummary
  selected: boolean
  onSelect: (pokemon: PokemonSummary) => void
  onPrefetch?: (pokemon: PokemonSummary) => void
  onTeamToggle?: (pokemon: PokemonSummary) => void
  onTeam?: boolean
}

export function PokemonCard({
  pokemon,
  selected,
  onSelect,
  onPrefetch,
  onTeamToggle,
  onTeam = false,
}: PokemonCardProps) {
  const p = pokemon
  const label = `${p.name.replace(/-/g, ' ')}, number ${p.id}`
  return (
    <div
      className={cn(
        'flex min-w-0 items-start gap-2 rounded-md border border-border bg-background p-2 text-left transition-[border-color,box-shadow] duration-150 ease-in-out',
        'hover:border-accent-border hover:shadow-card',
        selected && 'border-accent shadow-card',
      )}
    >
      <button
        type="button"
        className={cn(
          'flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left [font:inherit] text-inherit',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        )}
        onClick={() => onSelect(p)}
        onPointerEnter={() => onPrefetch?.(p)}
        onFocus={() => onPrefetch?.(p)}
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
          <PokemonName name={p.name} as="span" className="text-[0.95rem]" />
          <div className="flex flex-wrap gap-1">
            {p.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
      </button>
      {onTeamToggle ? (
        <button
          type="button"
          onClick={() => onTeamToggle(pokemon)}
          className={cn(
            'shrink-0 rounded border px-1.5 py-1 text-xs',
            onTeam
              ? 'border-accent bg-accent/15 text-foreground'
              : 'border-border text-muted-foreground',
          )}
          aria-pressed={onTeam}
          title={onTeam ? 'Remove from team' : 'Add to team'}
        >
          {onTeam ? '✓' : '+'}
        </button>
      ) : null}
    </div>
  )
}
