import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { articleKey, loadArticle } from '../articleLoader'

// Returns a handler to prefetch an article into the cache. Wire it to a card's
// onMouseEnter/onFocus: by the time the user clicks, the data is already there
// and the article page renders instantly. prefetchQuery is a no-op if the data
// is still fresh, so repeated hovers are cheap.
export function usePrefetchArticle() {
  const queryClient = useQueryClient()

  return useCallback(
    (item) => {
      queryClient.prefetchQuery({
        queryKey: articleKey(item.source, item.sourceId),
        queryFn: () => loadArticle(item.source, item.sourceId, item),
        staleTime: 5 * 60_000,
      })
    },
    [queryClient],
  )
}
