import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { ApiErrorLogProvider } from '../contexts/ApiErrorLogContext'
import { createQueryClient } from '../lib/queryClient'

export function StoryQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createQueryClient())
  return (
    <QueryClientProvider client={client}>
      <ApiErrorLogProvider>{children}</ApiErrorLogProvider>
    </QueryClientProvider>
  )
}
