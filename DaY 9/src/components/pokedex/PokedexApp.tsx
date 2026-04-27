import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { usePokedexFilter } from '../../hooks/usePokedexFilter'
import { usePokedexInfiniteList } from '../../hooks/usePokedexInfiniteList'
import type { PokemonSummary } from '../../lib/pokeapi'
import { PokedexLayout } from '../organisms/PokedexLayout'
import { PokedexListSection } from './PokedexListSection'

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

  return (
    <PokedexLayout
      list={
        <PokedexListSection
          infinite={infinite}
          listLive={listLive}
          onListLiveChange={setListLive}
          filter={filter}
          selectedId={selectedInView?.id ?? null}
          onSelect={setSelected}
        />
      }
      detail={
        <Suspense fallback={<DetailLoadingFallback />}>
          <PokemonDetailStub pokemon={selectedInView} />
        </Suspense>
      }
    />
  )
}
