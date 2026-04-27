import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { buildEvolutionSlugs, statMap, uniqueSortedMoves } from '../lib/pokeapi'
import {
  evolutionChainByUrlQuery,
  pokemonResourceQuery,
  pokemonSummaryBySlugQuery,
  speciesByUrlQuery,
} from '../lib/queryOptions'

export type PokemonDetailsState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | {
      status: 'ready'
      data: {
        stats: { key: string; base: number }[]
        moves: string[]
        evolution: string[]
        evolutionError: boolean
      }
    }

export function usePokemonDetailsQueries(pokemonId: number) {
  const resource = useQuery(pokemonResourceQuery(pokemonId))

  const speciesUrl = resource.data?.species.url
  const species = useQuery({
    ...speciesByUrlQuery(speciesUrl ?? ''),
    enabled: Boolean(speciesUrl),
  })

  const chainUrl = species.data?.evolution_chain.url
  const chain = useQuery({
    ...evolutionChainByUrlQuery(chainUrl ?? ''),
    enabled: Boolean(chainUrl),
  })

  const evolutionSlugs = useMemo(() => {
    if (!chain.data) {
      return [] as string[]
    }
    return buildEvolutionSlugs(chain.data)
  }, [chain.data])

  const slugQueries = useQueries({
    queries:
      evolutionSlugs.length > 0 && chain.isSuccess
        ? evolutionSlugs.map((slug) => ({
            ...pokemonSummaryBySlugQuery(slug),
            enabled: true,
          }))
        : [],
  })

  const state = useMemo((): PokemonDetailsState => {
    if (resource.isPending) {
      return { status: 'loading' }
    }
    if (resource.isError) {
      return {
        status: 'error',
        error:
          resource.error instanceof Error
            ? resource.error.message
            : 'Could not load details',
      }
    }
    const p = resource.data
    if (!p) {
      return { status: 'loading' }
    }
    const stats = statMap(p.stats)
    const moves = uniqueSortedMoves(p.moves)
    let evolution: string[] = []
    let evolutionError = false
    if (species.isError || chain.isError) {
      evolutionError = true
    } else if (chain.data) {
      evolution = buildEvolutionSlugs(chain.data)
    }
    return {
      status: 'ready',
      data: { stats, moves, evolution, evolutionError },
    }
  }, [resource.isPending, resource.isError, resource.error, resource.data, species.isError, chain.isError, chain.data])

  const evolutionLineLoading = Boolean(
    (speciesUrl && species.isPending) || (chainUrl && chain.isPending),
  )

  return {
    state,
    evolutionSlugs,
    slugQueries,
    evolutionLineLoading,
  }
}
