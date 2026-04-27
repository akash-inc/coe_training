import { useQueryClient } from '@tanstack/react-query'
import { useMemo, type ReactNode } from 'react'
import type { PokedexFilterResult } from '../../hooks/usePokedexFilter'
import type { PokedexInfiniteListResult } from '../../hooks/usePokedexInfiniteList'
import { useTeamRoster, useTeamToggle } from '../../hooks/useTeamToggle'
import type { PokemonSummary } from '../../lib/pokeapi'
import { pokemonResourceQuery } from '../../lib/queryOptions'
import { PokemonGrid } from '../organisms/PokemonGrid'
import { PokedexToolbar } from '../organisms/PokedexToolbar'
import { PokedexCacheControls } from './PokedexCacheControls'
import { PokedexListErrorSentinel } from './PokedexListErrorSentinel'
import { ListFetchError } from './pokedexShells'
import { TeamStrip } from './TeamStrip'
import { TriState, type TriStateValue } from '../patterns/TriState'

const SKELETON_PLACEHOLDERS = 36

type FilterBag = PokedexFilterResult
type InfiniteBag = PokedexInfiniteListResult

type PokedexListSectionProps = {
  infinite: InfiniteBag
  listLive: boolean
  onListLiveChange: (on: boolean) => void
  filter: FilterBag
  selectedId: number | null
  onSelect: (pokemon: PokemonSummary) => void
  showSentinel: boolean
}

export function PokedexListSection({
  infinite,
  listLive,
  onListLiveChange,
  filter,
  selectedId,
  onSelect,
  showSentinel,
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

  const errorMessage = error instanceof Error ? error.message : 'Request failed'

  const listTriState: TriStateValue<PokemonSummary[]> = useMemo(() => {
    if (!showSentinel && isError) {
      return { status: 'error', error: errorMessage }
    }
    if (isPending && !pagesData) {
      return { status: 'loading' }
    }
    return { status: 'ready', data: summaries }
  }, [showSentinel, isError, errorMessage, isPending, pagesData, summaries])

  const listContent: ReactNode = (
    <>
      {showSentinel ? <PokedexListErrorSentinel listLive={listLive} /> : null}
      <TriState value={listTriState}>
        {(s) => {
          if (s.status === 'error') {
            return (
              <ListFetchError role="alert" className="text-foreground">
                <p className="m-0">Could not load the Pokédex.</p>
                <p className="m-0 mt-2 break-words text-sm text-muted-foreground">
                  {s.error}
                </p>
              </ListFetchError>
            )
          }
          const gridLoading = s.status === 'loading'
          const items = gridLoading ? [] : filtered
          return (
            <div className="flex flex-col gap-4">
              <PokedexCacheControls listLive={listLive} onListLiveChange={onListLiveChange} />
              <TeamStrip
                teamIds={teamIds}
                nameById={teamNameById}
                busy={teamMutation.isPending}
              />
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
                    {isFetchingNextPage ? 'Loading…' : 'Load more Pokémon'}
                  </button>
                </div>
              ) : null}
            </div>
          )
        }}
      </TriState>
    </>
  )

  return listContent
}
