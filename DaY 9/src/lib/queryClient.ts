import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { reportApiError } from './apiErrorSink'

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

/**
 * Window focus refetch is enabled per-query where it helps the workshop (e.g. list); global default
 * stays false to avoid refetching heavy queries unintentionally.
 */
export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (err, q) => {
        const label =
          q?.meta && typeof (q.meta as { label?: string }).label === 'string'
            ? (q.meta as { label: string }).label
            : undefined
        reportApiError(toError(err), { kind: 'query', label })
      },
    }),
    mutationCache: new MutationCache({
      onError: (err, _v, _c, m) => {
        const label =
          m?.meta && typeof (m.meta as { label?: string }).label === 'string'
            ? (m.meta as { label: string }).label
            : undefined
        reportApiError(toError(err), { kind: 'mutation', label })
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
