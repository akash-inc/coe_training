import { useEffect, useState, type ReactNode } from 'react'
import { fetchPokemonSummaries, type PokemonSummary } from '../../lib/pokeapi'
import { PokedexLayout } from '../organisms/PokedexLayout'
import { PokemonDetailStub } from '../organisms/PokemonDetailStub'
import { PokemonIndexGrid } from '../organisms/PokemonIndexGrid'

const INITIAL_PAGE_SIZE = 24

export function PokedexApp() {
  const [summaries, setSummaries] = useState<PokemonSummary[]>([])
  const [selected, setSelected] = useState<PokemonSummary | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchPokemonSummaries(INITIAL_PAGE_SIZE, 0)
      .then((rows) => {
        if (cancelled) return
        setSummaries(rows)
        setLoadState('ready')
        setErrorMessage('')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLoadState('error')
        setErrorMessage(err instanceof Error ? err.message : 'Request failed')
      })
    return () => {
      cancelled = true
    }
  }, [])

  let listContent: ReactNode
  if (loadState === 'loading') {
    listContent = (
      <p className="text-muted-foreground" role="status">
        Loading Pokémon…
      </p>
    )
  } else if (loadState === 'error') {
    listContent = (
      <div className="text-foreground" role="alert">
        <p>Could not load the Pokédex.</p>
        <p className="mt-2 break-words text-sm text-muted-foreground">
          {errorMessage}
        </p>
      </div>
    )
  } else {
    listContent = (
      <PokemonIndexGrid
        items={summaries}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
      />
    )
  }

  return (
    <PokedexLayout
      list={listContent}
      detail={<PokemonDetailStub pokemon={selected} />}
    />
  )
}
