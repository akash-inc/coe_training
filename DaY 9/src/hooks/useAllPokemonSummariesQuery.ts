import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchAllPokemonSummaries } from '../lib/pokeapi'
import { queryKeys } from '../lib/queryKeys'

const STALE = Infinity
const GC = 1000 * 60 * 60 * 24

export function useAllPokemonSummariesQuery() {
  const [loadProgress, setLoadProgress] = useState<{
    loaded: number
    total: number
  } | null>(null)

  const q = useQuery({
    queryKey: queryKeys.allSummaries,
    queryFn: async ({ signal }) => {
      try {
        return await fetchAllPokemonSummaries(
          (loaded, total) => setLoadProgress({ loaded, total }),
          { signal },
        )
      } finally {
        setLoadProgress(null)
      }
    },
    staleTime: STALE,
    gcTime: GC,
  })

  return { ...q, loadProgress }
}
