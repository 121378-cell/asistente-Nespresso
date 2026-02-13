import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../config/queryClient';
import { getAnalytics, searchRepairs, getModels } from '../services/apiService';

/**
 * Hook to fetch analytics stats
 */
export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: getAnalytics,
    staleTime: 2 * 60 * 1000, // 2 minutes (analytics change more frequently)
  });
}

/**
 * Hook to search repairs
 */
export function useSearchRepairs(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => searchRepairs(query),
    enabled: query.length > 0, // Only search if query exists
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch machine models
 */
export function useModels() {
  return useQuery({
    queryKey: queryKeys.models,
    queryFn: getModels,
    staleTime: 10 * 60 * 1000, // 10 minutes (models rarely change)
  });
}
