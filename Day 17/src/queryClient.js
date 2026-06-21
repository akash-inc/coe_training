import { QueryClient } from '@tanstack/react-query'

// Two cache layers cooperate:
//  - React Query (in-memory): stale-while-revalidate within a session — shows
//    cached data instantly, refetches in the background once stale.
//  - Workbox runtime cache (on-disk, see vite.config): the same SWR/cache-first
//    policy at the network layer, which survives reloads and works offline.
// Aligning their windows keeps behavior consistent across both.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // feeds are "fresh" for a minute, then revalidate
      gcTime: 24 * 60 * 60_000, // keep cached data a day so revisits are instant
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // re-validate when the network comes back
    },
  },
})
