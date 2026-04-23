import { useCallback, useMemo, useState } from 'react'
import type { PokemonSummary } from '../lib/pokeapi'

export type PokedexSort = 'id' | 'name'

// Type filter: a Pokémon must include *every* selected type (AND all).
export function applyPokedexFilter(
  items: PokemonSummary[],
  opts: {
    query: string
    sort: PokedexSort
    requiredTypes: Set<string>
  },
): PokemonSummary[] {
  const raw = opts.query.trim().toLowerCase()
  const q = raw.replace(/\s+/g, '-')
  const rows = items.filter((p) => {
    if (q) {
      const slug = p.name.toLowerCase()
      if (!slug.includes(q)) {
        return false
      }
    }
    for (const t of opts.requiredTypes) {
      if (!p.types.includes(t)) {
        return false
      }
    }
    return true
  })
  return [...rows].sort((a, b) => {
    if (opts.sort === 'id') {
      return a.id - b.id
    }
    return a.name.localeCompare(b.name)
  })
}

export function usePokedexFilter(items: PokemonSummary[]) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<PokedexSort>('id')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(() => new Set())

  const availableTypes = useMemo(() => {
    const s = new Set<string>()
    for (const p of items) {
      for (const t of p.types) {
        s.add(t)
      }
    }
    return [...s].sort()
  }, [items])

  const toggleType = useCallback((t: string) => {
    setSelectedTypes((prev) => {
      const n = new Set(prev)
      if (n.has(t)) {
        n.delete(t)
      } else {
        n.add(t)
      }
      return n
    })
  }, [])

  const clearFilters = useCallback(() => {
    setQuery('')
    setSelectedTypes(new Set())
  }, [])

  const hasActiveFilters = useMemo(
    () => query.trim() !== '' || selectedTypes.size > 0,
    [query, selectedTypes],
  )

  const filtered = useMemo(
    () =>
      applyPokedexFilter(items, {
        query,
        sort,
        requiredTypes: selectedTypes,
      }),
    [items, query, sort, selectedTypes],
  )

  const stats = useMemo(
    () => ({
      total: items.length,
      visible: filtered.length,
    }),
    [items.length, filtered],
  )

  return {
    query,
    setQuery,
    sort,
    setSort,
    selectedTypes,
    toggleType,
    clearFilters,
    availableTypes,
    filtered,
    stats,
    hasActiveFilters,
  }
}
