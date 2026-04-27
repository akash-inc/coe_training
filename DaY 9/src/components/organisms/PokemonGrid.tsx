import type { PokemonSummary } from '../../lib/pokeapi'
import { PokemonCard } from '../molecules/PokemonCard'

const gridClass =
  'grid w-full grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3'

function CardSkeleton() {
  return (
    <div
      className="flex min-w-0 items-start gap-3 rounded-md border border-border/60 bg-background/50 p-3"
      aria-hidden
    >
      <div className="h-[72px] w-[72px] shrink-0 rounded-sm bg-border/40 motion-safe:animate-pulse" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-3 w-10 rounded bg-border/50 motion-safe:animate-pulse" />
        <div className="h-4 w-24 max-w-full rounded bg-border/50 motion-safe:animate-pulse" />
        <div className="flex gap-1">
          <div className="h-5 w-12 rounded-sm bg-border/40 motion-safe:animate-pulse" />
          <div className="h-5 w-14 rounded-sm bg-border/40 motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  )
}

type PokemonGridProps = {
  items: PokemonSummary[]
  selectedId: number | null
  onSelect: (pokemon: PokemonSummary) => void
  onPrefetch?: (pokemon: PokemonSummary) => void
  onTeamToggle?: (pokemon: PokemonSummary) => void
  teamIds?: Set<number>
  isLoading: boolean
  /** Placeholder card count while `isLoading` is true */
  skeletonCount?: number
}

export function PokemonGrid({
  items,
  selectedId,
  onSelect,
  onPrefetch,
  onTeamToggle,
  teamIds,
  isLoading,
  skeletonCount = 12,
}: PokemonGridProps) {
  if (isLoading) {
    return (
      <div
        className={gridClass}
        role="status"
        aria-busy="true"
        aria-label="Loading Pokémon"
      >
        {Array.from({ length: skeletonCount }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="m-0 text-sm text-muted-foreground" role="status">
        No Pokémon in the <strong className="font-medium text-foreground/85">left-hand list</strong> match. Try
        clearing search and type filters, or a broader name.
      </p>
    )
  }

  return (
    <div className={gridClass}>
      {items.map((p) => (
        <PokemonCard
          key={p.id}
          pokemon={p}
          selected={selectedId === p.id}
          onSelect={onSelect}
          onPrefetch={onPrefetch}
          onTeamToggle={onTeamToggle}
          onTeam={teamIds?.has(p.id) ?? false}
        />
      ))}
    </div>
  )
}
