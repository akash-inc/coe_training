import { useQueryClient } from '@tanstack/react-query'
import { useMemo, type ReactNode } from 'react'
import type { PokedexFilterResult } from '../../hooks/usePokedexFilter'
import type { PokedexInfiniteListResult } from '../../hooks/usePokedexInfiniteList'
import { useTeamRoster, useTeamToggle } from '../../hooks/useTeamToggle'
import type { PokemonSummary } from '../../lib/pokeapi'
import { listLoadErrorCopy } from '../../lib/userFacingErrors'
import { pokemonResourceQuery } from '../../lib/queryOptions'
import { PokemonGrid } from '../organisms/PokemonGrid'
import { PokedexToolbar } from '../organisms/PokedexToolbar'
import { PokedexCacheControls } from './PokedexCacheControls'
import { ListFetchError } from './pokedexShells'
import { TeamStrip } from './TeamStrip'
import { TriState, type TriStateValue } from '../patterns/TriState'

const SKELETON_PLACEHOLDERS = 36

type PokedexListSectionProps = {
  infinite: PokedexInfiniteListResult
  listLive: boolean
  onListLiveChange: (on: boolean) => void
  filter: PokedexFilterResult
  selectedId: number | null
  onSelect: (pokemon: PokemonSummary) => void
  /** Cache teaching controls live next to the list; hide in battle mode to reduce noise. */
  showCacheControls?: boolean
}

export function PokedexListSection({
  infinite,
  listLive,
  onListLiveChange,
  filter,
  selectedId,
  onSelect,
  showCacheControls = true,
}: PokedexListSectionProps) {
  const queryClient = useQueryClient()
  const { data: teamIds = [] } = useTeamRoster()
  const teamMutation = useTeamToggle()
  const {
    query,
    setQuery,
    sort,
    setSort,
    selectedTypes,
    toggleType,
    clearFilters,
    availableTypes,
    filtered,
    stats,
    hasActiveFilters,
  } = filter
  const {
    summaries,
    totalNationalCount,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    data: pagesData,
  } = infinite

  const teamNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const s of summaries) {
      m.set(s.id, s.name)
    }
    return m
  }, [summaries])

  const onPrefetch = (p: PokemonSummary) => {
    void queryClient.prefetchQuery(pokemonResourceQuery(p.id))
  }

  const onTeamToggle = (pokemon: PokemonSummary) => {
    teamMutation.mutate({ pokemonId: pokemon.id })
  }

  const listTriState: TriStateValue<PokemonSummary[]> = useMemo(() => {
    if (isError) {
      return { status: 'error', error: listLoadErrorCopy(error).heading }
    }
    if (isPending && !pagesData) {
      return { status: 'loading' }
    }
    return { status: 'ready', data: summaries }
  }, [isError, error, isPending, pagesData, summaries])

  const listContent: ReactNode = (
    <TriState value={listTriState}>
      {(s) => {
        if (s.status === 'error') {
          const copy = listLoadErrorCopy(error)
          return (
            <ListFetchError role="alert" className="text-foreground">
              <p className="m-0 text-base font-semibold leading-snug text-foreground">
                {copy.heading}
              </p>
              <p className="m-0 mt-2 text-sm leading-relaxed text-muted-foreground">
                {copy.body}{' '}
                <span className="text-muted-foreground/90">
                  (The right panel only shows details after the left list loads.)
                </span>
              </p>
              {copy.technical ? (
                <details className="mt-2 text-left">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    Technical details
                  </summary>
                  <p className="m-0 mt-1 break-words font-mono text-[11px] text-muted-foreground">
                    {copy.technical}
                  </p>
                </details>
              ) : null}
              <button
                type="button"
                className="mt-4 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
                onClick={() => void refetch()}
                disabled={isRefetching}
              >
                {isRefetching ? 'One moment…' : 'Try again'}
              </button>
            </ListFetchError>
          )
        }
        const gridLoading = s.status === 'loading'
        const items = gridLoading ? [] : filtered
        return (
          <div className="flex flex-col gap-4">
            <TeamStrip
              teamIds={teamIds}
              nameById={teamNameById}
              busy={teamMutation.isPending}
              lastActionMessage={
                teamMutation.isError && teamMutation.error
                  ? teamMutation.error.message
                  : null
              }
            />
            {showCacheControls ? (
              <PokedexCacheControls listLive={listLive} onListLiveChange={onListLiveChange} />
            ) : null}
            {s.status === 'ready' ? (
              <PokedexToolbar
                query={query}
                onQueryChange={setQuery}
                sort={sort}
                onSortChange={setSort}
                availableTypes={availableTypes}
                selectedTypes={selectedTypes}
                onToggleType={toggleType}
                onClearFilters={clearFilters}
                visibleCount={stats.visible}
                totalCount={stats.total}
                nationalTotalCount={totalNationalCount}
                hasActiveFilters={hasActiveFilters}
              />
            ) : null}
            <PokemonGrid
              isLoading={gridLoading}
              items={items}
              selectedId={selectedId}
              onSelect={onSelect}
              onPrefetch={onPrefetch}
              onTeamToggle={onTeamToggle}
              teamIds={new Set(teamIds)}
              skeletonCount={SKELETON_PLACEHOLDERS}
            />
            {s.status === 'ready' && hasNextPage ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  className="rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground"
                  onClick={() => void fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading more…' : 'Load more Pokémon'}
                </button>
              </div>
            ) : null}
          </div>
        )
      }}
    </TriState>
  )

  return listContent
}
