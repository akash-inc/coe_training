import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchPokemonSummaries, type PokemonSummary } from '../../lib/pokeapi'
import { TriState, type TriStateValue } from '../patterns/TriState'
import { ListFetchError } from './pokedexShells'
import { PokedexLayout } from '../organisms/PokedexLayout'
import { PokemonDetailStub } from '../organisms/PokemonDetailStub'
import { PokemonGrid } from '../organisms/PokemonGrid'

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
        const items = s.status === 'ready' ? s.data : []
        return (
          <PokemonGrid
            isLoading={isLoading}
            items={items}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
            skeletonCount={INITIAL_PAGE_SIZE}
          />
        )
      }}
    </TriState>
  )

  return (
    <PokedexLayout
      list={listContent}
      detail={<PokemonDetailStub pokemon={selected} />}
    />
  )
}
