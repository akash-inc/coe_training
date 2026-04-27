import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { usePokedexFilter } from '../../hooks/usePokedexFilter'
import { usePokedexInfiniteList } from '../../hooks/usePokedexInfiniteList'
import type { PokemonSummary } from '../../lib/pokeapi'
import { PanelModeToggle, type PokedexRightPanelMode } from '../molecules/PanelModeToggle'
import { PokedexLayout } from '../organisms/PokedexLayout'
import { BattlePanel } from './BattlePanel'
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
  const [rightMode, setRightMode] = useState<PokedexRightPanelMode>('details')
  const infinite = usePokedexInfiniteList({ listLive })
  const filter = usePokedexFilter(infinite.summaries)
  const [selected, setSelected] = useState<PokemonSummary | null>(null)

  const selectedInView = useMemo(() => {
    if (!selected) {
      return null
    }
    return filter.filtered.some((p) => p.id === selected.id) ? selected : null
  }, [selected, filter.filtered])

  const nameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const s of infinite.summaries) {
      m.set(s.id, s.name)
    }
    if (selected) {
      m.set(selected.id, selected.name)
    }
    return m
  }, [infinite.summaries, selected])

  useEffect(() => {
    const el = document.documentElement
    if (rightMode === 'battle') {
      el.removeAttribute('data-accent-type')
      return
    }
    const primary = selectedInView?.types[0]
    if (primary) {
      el.setAttribute('data-accent-type', primary)
    } else {
      el.removeAttribute('data-accent-type')
    }
  }, [selectedInView, rightMode])

  const lede =
    rightMode === 'details' ? (
      <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
        You get two side-by-side areas: a searchable{' '}
        <strong className="font-medium text-foreground/90">Pokémon list on the left</strong> (cards you scroll
        and tap), and a <strong className="font-medium text-foreground/90">details area on the right</strong>.
        Data comes from the open PokéAPI. The shell uses your pick’s main type; adjust the app bar to match.
        Use the toggle above to open <strong className="font-medium text-foreground/90">Battle</strong> and run a
        small party sim.
      </p>
    ) : (
      <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
        Build <strong className="font-medium text-foreground/90">team A and team B</strong> from the list on the
        left, run a <strong className="font-medium text-foreground/90">simulation</strong>, then use the timeline to
        step backward and forward through each move. You can copy your saved party to team A or B with one button.
      </p>
    )

  return (
    <PokedexLayout
      headerAside={<PanelModeToggle value={rightMode} onChange={setRightMode} />}
      lede={lede}
      rightPanelLabel={
        rightMode === 'battle'
          ? 'Battle on the right — build two teams and run a simulation'
          : 'Details on the right — appears after you pick a Pokémon'
      }
      list={
        <PokedexListSection
          infinite={infinite}
          listLive={listLive}
          onListLiveChange={setListLive}
          filter={filter}
          selectedId={selectedInView?.id ?? null}
          onSelect={setSelected}
          showCacheControls={rightMode === 'details'}
        />
      }
      detail={
        rightMode === 'battle' ? (
          <BattlePanel selected={selected} nameById={nameById} />
        ) : (
          <Suspense fallback={<DetailLoadingFallback />}>
            <PokemonDetailStub pokemon={selectedInView} />
          </Suspense>
        )
      }
    />
  )
}
