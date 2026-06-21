import { QueryClient } from '@tanstack/react-query'

// Single shared client. staleTime/gcTime are tuned further in the caching step
// (Commit 10) to line up with the service-worker runtime caching policy.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min: feeds don't change second-to-second
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
