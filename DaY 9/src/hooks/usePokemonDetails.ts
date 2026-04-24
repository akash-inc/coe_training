import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { PokemonSummary } from '../lib/pokeapi'
import {
  fetchPokemonDetailsPayload,
  type PokemonDetailsPayload,
} from '../lib/pokeapi/queries'
import { queryKeys } from '../lib/queryKeys'

export type PokemonDetailsState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: PokemonDetailsPayload }

const STALE_MS = 1000 * 60 * 10

/**
 * Fetches base stats, moves, and evolution chain. Results are cached by `pokemon.id` via
 * React Query. Parent can still pass `key={pokemon.id}` on the subtree for a clean
 * local UI reset.
 */
export function usePokemonDetails(pokemon: PokemonSummary) {
  const q = useQuery({
    queryKey: queryKeys.details(pokemon.id),
    queryFn: ({ signal }) => fetchPokemonDetailsPayload(pokemon.id, { signal }),
    staleTime: STALE_MS,
  })

  return useMemo((): PokemonDetailsState => {
    if (q.isPending) {
      return { status: 'loading' }
    }
    if (q.isError) {
      return {
        status: 'error',
        error: q.error instanceof Error ? q.error.message : 'Could not load details',
      }
    }
    if (q.data) {
      return { status: 'ready', data: q.data }
    }
    return { status: 'loading' }
  }, [q.isPending, q.isError, q.data, q.error])
}
