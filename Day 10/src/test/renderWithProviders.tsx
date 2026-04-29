import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ApiErrorLogProvider } from '../contexts/ApiErrorLogContext'

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

type Options = RenderOptions & {
  queryClient?: QueryClient
  initialEntries?: string[]
}

export function renderWithProviders(
  ui: ReactNode,
  { queryClient, initialEntries = ['/'], ...options }: Options = {},
) {
  const client = queryClient ?? createTestQueryClient()
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ApiErrorLogProvider>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </ApiErrorLogProvider>
      </QueryClientProvider>
    )
  }
  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient: client }
}
