import { useEffect, useRef } from 'react'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'

// Generic infinite-feed hook. It takes the query options (so each panel passes
// its own source fetcher and keeps importing only its own API module — the RSS
// parser must not leak into the HN chunk). Returns flattened items plus a
// sentinel ref that triggers fetchNextPage when scrolled near the bottom.
export function useInfiniteFeed(options) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(options)

  const items = data.pages.flatMap((page) => page.items)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return

    // rootMargin pre-loads the next page before the sentinel is fully visible.
    // React Query ignores fetchNextPage() while a page is already in flight,
    // so no extra guard is needed.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage()
      },
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  return { items, sentinelRef, hasNextPage, isFetchingNextPage }
}
