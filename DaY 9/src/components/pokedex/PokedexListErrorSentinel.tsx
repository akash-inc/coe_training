import { usePokedexInfiniteList } from '../../hooks/usePokedexInfiniteList'

/**
 * Subscribes to the same infinite query as the parent with `throwOnError: true` so
 * `QueryErrorBoundary` can catch list failures; data is not rendered here.
 */
export function PokedexListErrorSentinel({ listLive }: { listLive: boolean }) {
  usePokedexInfiniteList({ listLive, throwOnError: true })
  return null
}
