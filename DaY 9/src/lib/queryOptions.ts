import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import {
  dtoToSummary,
  fetchEvolutionChainByUrl,
  fetchPokemonDtoByIdentifier,
  fetchPokemonResource,
  fetchPokemonSummariesPage,
  fetchSpeciesByUrl,
} from './pokeapi'
import { queryKeys } from './queryKeys'
import { readTeamFromStorage } from './teamStorage'

const STALE_MS = 1000 * 60 * 10

export const POKEDEX_PAGE_SIZE = 24

export const pokemonResourceQuery = (id: number) =>
  queryOptions({
    queryKey: queryKeys.pokemonResource(id),
    queryFn: ({ signal }) => fetchPokemonResource(id, { signal }),
    staleTime: STALE_MS,
    meta: { label: `Pokémon resource #${id}` } as const,
  })

export const speciesByUrlQuery = (url: string) =>
  queryOptions({
    queryKey: queryKeys.speciesByUrl(url),
    queryFn: ({ signal }) => fetchSpeciesByUrl(url, { signal }),
    staleTime: STALE_MS,
    meta: { label: 'Species' } as const,
  })

export const evolutionChainByUrlQuery = (url: string) =>
  queryOptions({
    queryKey: queryKeys.evolutionByUrl(url),
    queryFn: ({ signal }) => fetchEvolutionChainByUrl(url, { signal }),
    staleTime: STALE_MS,
    meta: { label: 'Evolution chain' } as const,
  })

export const pokemonSummaryBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.summaryBySlug(slug),
    queryFn: async ({ signal }) => {
      const dto = await fetchPokemonDtoByIdentifier(slug, { signal })
      return dtoToSummary(dto)
    },
    staleTime: STALE_MS,
  })

export const pokedexListInfinite = (pageSize: number = POKEDEX_PAGE_SIZE) =>
  infiniteQueryOptions({
    queryKey: queryKeys.listInfinite(pageSize),
    queryFn: async ({ pageParam, signal }) =>
      fetchPokemonSummariesPage(pageSize, pageParam as number, { signal }),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset,
    staleTime: 1000 * 60 * 2,
    meta: { label: 'Pokédex list (paged)' } as const,
  })

export const teamRosterQuery = () =>
  queryOptions({
    queryKey: queryKeys.team,
    queryFn: () => readTeamFromStorage(),
    staleTime: Infinity,
    gcTime: Infinity,
    meta: { label: 'Team roster' } as const,
  })

/** Types inferred for consumers and docs */
export type PokemonResourceDto = Awaited<ReturnType<typeof fetchPokemonResource>>
