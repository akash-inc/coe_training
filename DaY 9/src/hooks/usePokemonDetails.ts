import { useEffect, useState } from 'react'
import type { PokemonSummary } from '../lib/pokeapi'
import {
  fetchPokemonDetailsPayload,
  type PokemonDetailsPayload,
} from '../lib/pokeapi/queries'

export type PokemonDetailsState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: PokemonDetailsPayload }

/**
 * Fetches base stats, moves, and evolution chain. Parent should pass `key={pokemon.id}` so
 * a new selection remounts and shows a fresh loading state.
 */
export function usePokemonDetails(pokemon: PokemonSummary) {
  const [state, setState] = useState<PokemonDetailsState>(() => ({ status: 'loading' }))

  useEffect(() => {
    const c = new AbortController()
    fetchPokemonDetailsPayload(pokemon.id, { signal: c.signal })
      .then((data) => {
        if (!c.signal.aborted) {
          setState({ status: 'ready', data })
        }
      })
      .catch((e: unknown) => {
        if (c.signal.aborted) {
          return
        }
        const message = e instanceof Error ? e.message : 'Could not load details'
        setState({ status: 'error', error: message })
      })
    return () => c.abort()
  }, [pokemon.id])

  return state
}
