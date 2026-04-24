import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAllPokemonSummariesQuery } from '../../hooks/useAllPokemonSummariesQuery'
import { usePokedexFilter } from '../../hooks/usePokedexFilter'
import type { PokemonSummary } from '../../lib/pokeapi'
import { TriState, type TriStateValue } from '../patterns/TriState'
import { ListFetchError } from './pokedexShells'
import { PokedexLayout } from '../organisms/PokedexLayout'
import { PokedexToolbar } from '../organisms/PokedexToolbar'
import { PokemonGrid } from '../organisms/PokemonGrid'

const PokemonDetailStub = lazy(() =>
  import('../organisms/PokemonDetailStub').then((m) => ({
    default: m.PokemonDetailStub,
  })),
)

const SKELETON_PLACEHOLDERS = 36

function DetailLoadingFallback() {
  return (
    <div
      className="min-h-40 w-full rounded-lg bg-muted/15 motion-safe:animate-pulse"
      aria-hidden
    />
  )
}

export function PokedexApp() {
  const [selected, setSelected] = useState<PokemonSummary | null>(null)
  const {
    data: summaries = [],
    status: queryStatus,
    isError,
    error,
    loadProgress,
  } = useAllPokemonSummariesQuery()

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
  } = usePokedexFilter(summaries)

  const selectedInView = useMemo(() => {
    if (!selected) {
      return null
    }
    return filtered.some((p) => p.id === selected.id) ? selected : null
  }, [selected, filtered])

  useEffect(() => {
    const el = document.documentElement
    const primary = selectedInView?.types[0]
    if (primary) {
      el.setAttribute('data-accent-type', primary)
    } else {
      el.removeAttribute('data-accent-type')
    }
  }, [selectedInView])

  const errorMessage = error instanceof Error ? error.message : 'Request failed'

  const listTriState: TriStateValue<PokemonSummary[]> = useMemo(() => {
    if (isError) {
      return { status: 'error', error: errorMessage }
    }
    if (queryStatus !== 'success') {
      return { status: 'loading' }
    }
    return { status: 'ready', data: summaries }
  }, [isError, errorMessage, queryStatus, summaries])

  const listContent: ReactNode = (
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
        const isLoading = s.status === 'loading'
        const items = isLoading ? [] : filtered
        return (
          <div className="flex flex-col gap-4">
            {loadProgress && isLoading ? (
              <div className="rounded-xl border border-border/70 bg-card/50 px-3 py-3">
                <p
                  className="m-0 text-xs font-medium text-foreground"
                  id="dex-load-label"
                >
                  Loading national Pokédex
                </p>
                <p className="m-0 mt-1 text-[11px] text-muted-foreground">
                  {loadProgress.loaded === 0
                    ? `Preparing ${loadProgress.total.toLocaleString()} species…`
                    : `${loadProgress.loaded.toLocaleString()} / ${loadProgress.total.toLocaleString()} species`}
                </p>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-border/50"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={loadProgress.total}
                  aria-valuenow={loadProgress.loaded}
                  aria-labelledby="dex-load-label"
                >
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent/70 transition-[width] duration-200 ease-out"
                    style={{
                      width:
                        loadProgress.total > 0
                          ? `${(loadProgress.loaded / loadProgress.total) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
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
                hasActiveFilters={hasActiveFilters}
              />
            ) : null}
            <PokemonGrid
              isLoading={isLoading}
              items={items}
              selectedId={selectedInView?.id ?? null}
              onSelect={setSelected}
              skeletonCount={SKELETON_PLACEHOLDERS}
            />
          </div>
        )
      }}
    </TriState>
  )

  return (
    <PokedexLayout
      list={listContent}
      detail={
        <Suspense fallback={<DetailLoadingFallback />}>
          <PokemonDetailStub pokemon={selectedInView} />
        </Suspense>
      }
    />
  )
}
