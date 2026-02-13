import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 *
 * Configures caching, retry logic, and refetch behavior
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus (can be annoying during development)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

/**
 * Query Keys
 *
 * Centralized query keys for consistency
 */
export const queryKeys = {
  repairs: ['repairs'] as const,
  repair: (id: string) => ['repairs', id] as const,
  analytics: ['analytics'] as const,
  stats: ['analytics', 'stats'] as const,
  models: ['analytics', 'models'] as const,
  search: (query: string) => ['analytics', 'search', query] as const,
};
