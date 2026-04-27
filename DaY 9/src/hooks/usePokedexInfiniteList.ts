import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { PokemonSummary } from '../lib/pokeapi'
import { POKEDEX_PAGE_SIZE, pokedexListInfinite } from '../lib/queryOptions'

type Opts = {
  throwOnError?: boolean
  /** When true, poll the list (workshop: background refetch). */
  listLive?: boolean
}

export function usePokedexInfiniteList(opts?: Opts) {
  const q = useInfiniteQuery({
    ...pokedexListInfinite(POKEDEX_PAGE_SIZE),
    refetchOnWindowFocus: true,
    refetchInterval: opts?.listLive ? 30_000 : false,
    throwOnError: opts?.throwOnError,
  })

  const summaries = useMemo(
    () => q.data?.pages.flatMap((p) => p.summaries) ?? ([] as PokemonSummary[]),
    [q.data?.pages],
  )

  const totalNationalCount = q.data?.pages[0]?.totalCount ?? 0

  return {
    ...q,
    summaries,
    totalNationalCount,
    pageSize: POKEDEX_PAGE_SIZE,
  }
}

export type PokedexInfiniteListResult = ReturnType<typeof usePokedexInfiniteList>
