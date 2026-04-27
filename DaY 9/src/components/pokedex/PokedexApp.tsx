import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePokedexFilter } from '../../hooks/usePokedexFilter'
import { usePokedexInfiniteList } from '../../hooks/usePokedexInfiniteList'
import type { PokemonSummary } from '../../lib/pokeapi'
import { PokedexLayout } from '../organisms/PokedexLayout'
import { PokedexListSection } from './PokedexListSection'
import { QueryErrorBoundary } from './QueryErrorBoundary'
import { ListFetchError } from './pokedexShells'

const PokemonDetailStub = lazy(() =>
  import('../organisms/PokemonDetailStub').then((m) => ({
    default: m.PokemonDetailStub,
  })),
)

function DetailLoadingFallback() {
  return (
    <div
      className="min-h-40 w-full rounded-lg bg-muted/15 motion-safe:animate-pulse"
      aria-hidden
    />
  )
}

export function PokedexApp() {
  const [listLive, setListLive] = useState(false)
  const infinite = usePokedexInfiniteList({ listLive })
  const filter = usePokedexFilter(infinite.summaries)
  const [selected, setSelected] = useState<PokemonSummary | null>(null)

  const selectedInView = useMemo(() => {
    if (!selected) {
      return null
    }
    return filter.filtered.some((p) => p.id === selected.id) ? selected : null
  }, [selected, filter.filtered])

  useEffect(() => {
    const el = document.documentElement
    const primary = selectedInView?.types[0]
    if (primary) {
      el.setAttribute('data-accent-type', primary)
    } else {
      el.removeAttribute('data-accent-type')
    }
  }, [selectedInView])

  const listErrorFallback = (args: { error: Error; reset: () => void }) => (
    <ListFetchError role="alert" className="text-foreground">
      <p className="m-0">The Pokédex list failed to load.</p>
      <p className="m-0 mt-2 break-words text-sm text-muted-foreground">
        {args.error.message}
      </p>
      <button
        type="button"
        className="mt-3 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground"
        onClick={args.reset}
      >
        Try again
      </button>
    </ListFetchError>
  )

  const listNode: ReactNode = (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <QueryErrorBoundary onReset={reset} fallback={listErrorFallback}>
          <PokedexListSection
            infinite={infinite}
            listLive={listLive}
            onListLiveChange={setListLive}
            filter={filter}
            selectedId={selectedInView?.id ?? null}
            onSelect={setSelected}
            showSentinel
          />
        </QueryErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )

  return (
    <PokedexLayout
      list={listNode}
      detail={
        <Suspense fallback={<DetailLoadingFallback />}>
          <PokemonDetailStub pokemon={selectedInView} />
        </Suspense>
      }
    />
  )
}
