import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchAllPokemonSummaries, type PokemonSummary } from '../../lib/pokeapi'
import { usePokedexFilter } from '../../hooks/usePokedexFilter'
import { TriState, type TriStateValue } from '../patterns/TriState'
import { ListFetchError } from './pokedexShells'
import { PokedexLayout } from '../organisms/PokedexLayout'
import { PokedexToolbar } from '../organisms/PokedexToolbar'
import { PokemonDetailStub } from '../organisms/PokemonDetailStub'
import { PokemonGrid } from '../organisms/PokemonGrid'

const SKELETON_PLACEHOLDERS = 36

export function PokedexApp() {
  const [summaries, setSummaries] = useState<PokemonSummary[]>([])
  const [selected, setSelected] = useState<PokemonSummary | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const [errorMessage, setErrorMessage] = useState('')
  const [loadProgress, setLoadProgress] = useState<{
    loaded: number
    total: number
  } | null>(null)

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

  useEffect(() => {
    const c = new AbortController()
    fetchAllPokemonSummaries(
      (loaded, total) => {
        setLoadProgress({ loaded, total })
      },
      { signal: c.signal },
    )
      .then((rows) => {
        setSummaries(rows)
        setLoadState('ready')
        setErrorMessage('')
        setLoadProgress(null)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        setLoadState('error')
        setErrorMessage(err instanceof Error ? err.message : 'Request failed')
        setLoadProgress(null)
      })
    return () => c.abort()
  }, [])

  const listTriState: TriStateValue<PokemonSummary[]> = useMemo(() => {
    if (loadState === 'loading') {
      return { status: 'loading' }
    }
    if (loadState === 'error') {
      return { status: 'error', error: errorMessage }
    }
    return { status: 'ready', data: summaries }
  }, [loadState, errorMessage, summaries])

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
                <p className="m-0 text-xs font-medium text-foreground" id="dex-load-label">
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
      detail={<PokemonDetailStub pokemon={selectedInView} />}
    />
  )
}
