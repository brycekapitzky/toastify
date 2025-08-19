'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '../components/AuthContext'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a client instance that won't be recreated on every render
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3,
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          staleTime: 5 * 60 * 1000, // 5 minutes
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          refetchOnMount: true,
        },
        mutations: {
          retry: 1,
          onError: (error) => {
            console.error('Mutation error:', error)
            // TODO: Send to error reporting service
          }
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}