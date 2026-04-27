import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toError } from '../api/errors'
import { apiErrorBus } from './errorBus'

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (err) => {
        apiErrorBus.emit(toError(err))
      },
    }),
    mutationCache: new MutationCache({
      onError: (err) => {
        apiErrorBus.emit(toError(err))
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: true,
        throwOnError: false,
      },
      mutations: {
        retry: 0,
        throwOnError: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
