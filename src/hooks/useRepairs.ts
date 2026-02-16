import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../config/queryClient';
import apiService from '../../services/apiService';
import type { SavedRepair } from '../../types';

/**
 * Hook to fetch all repairs
 */
export function useRepairs() {
  return useQuery({
    queryKey: queryKeys.repairs,
    queryFn: () => apiService.getAllRepairs(),
  });
}

/**
 * Hook to fetch a single repair by ID
 */
export function useRepair(id: string) {
  return useQuery({
    queryKey: queryKeys.repair(id),
    queryFn: () => apiService.getRepairById(id),
    enabled: !!id, // Only run if ID exists
  });
}

/**
 * Hook to create a new repair
 */
export function useCreateRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repair: Omit<SavedRepair, 'id'>) => apiService.createRepair(repair),
    onSuccess: () => {
      // Invalidate repairs list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs });
    },
  });
}

/**
 * Hook to update an existing repair
 */
export function useUpdateRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SavedRepair> }) =>
      apiService.updateRepair(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.repairs });

      // Snapshot previous value
      const previousRepairs = queryClient.getQueryData<SavedRepair[]>(queryKeys.repairs);

      // Optimistically update
      if (previousRepairs) {
        queryClient.setQueryData<SavedRepair[]>(queryKeys.repairs, (old) =>
          old ? old.map((repair) => (repair.id === id ? { ...repair, ...data } : repair)) : []
        );
      }

      return { previousRepairs };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousRepairs) {
        queryClient.setQueryData(queryKeys.repairs, context.previousRepairs);
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs });
    },
  });
}

/**
 * Hook to delete a repair
 */
export function useDeleteRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteRepair(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.repairs });

      // Snapshot previous value
      const previousRepairs = queryClient.getQueryData<SavedRepair[]>(queryKeys.repairs);

      // Optimistically remove
      if (previousRepairs) {
        queryClient.setQueryData<SavedRepair[]>(
          queryKeys.repairs,
          previousRepairs.filter((repair) => repair.id !== id)
        );
      }

      return { previousRepairs };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousRepairs) {
        queryClient.setQueryData(queryKeys.repairs, context.previousRepairs);
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs });
    },
  });
}
