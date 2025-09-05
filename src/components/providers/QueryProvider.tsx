// React Query Provider
// Story 1.4: Basic Family Dashboard

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client with stable reference
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // Stale time: 5 minutes for most queries
          staleTime: 5 * 60 * 1000,
          // Cache time: 10 minutes
          gcTime: 10 * 60 * 1000,
          // Retry failed requests 3 times with exponential backoff
          retry: 3,
          // Refetch on window focus in production
          refetchOnWindowFocus: process.env.NODE_ENV === 'production',
          // Refetch on mount if data is stale
          refetchOnMount: 'always',
          // Network mode - continue to work offline
          networkMode: 'offlineFirst',
        },
        mutations: {
          // Retry mutations once
          retry: 1,
          // Network mode for mutations
          networkMode: 'offlineFirst',
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right" as const
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}