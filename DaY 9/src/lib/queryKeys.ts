/**
 * Key factories for TanStack Query. Use stable tuples for `invalidateQueries` by prefix, e.g. `['pokemon']`.
 */
export const queryKeys = {
  root: ['pokemon'] as const,

  allSummaries: ['pokemon', 'all-summaries'] as const,

  /** @deprecated Replaced by listInfinite; kept for any legacy invalidation demos */
  details: (id: number) => ['pokemon', 'details', id] as const,

  listInfinite: (pageSize: number) => ['pokemon', 'list-infinite', pageSize] as const,

  pokemonResource: (id: number) => ['pokemon', 'resource', id] as const,

  speciesByUrl: (url: string) => ['pokemon', 'species', url] as const,

  evolutionByUrl: (url: string) => ['pokemon', 'evolution-chain', url] as const,

  summaryBySlug: (slug: string) => ['pokemon', 'summary', 'slug', slug] as const,

  team: ['pokemon', 'team'] as const,
}
