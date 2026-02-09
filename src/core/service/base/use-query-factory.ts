import { useQuery, useMutation, useQueryClient, keepPreviousData, type UseQueryOptions, type UseMutationOptions, type QueryClient  } from '@tanstack/react-query';

export interface QueryConfig<TData, TParams = void> {
  queryKey: (params?: TParams) => unknown[];
  queryFn: (params?: TParams) => Promise<TData>;
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;
}

export interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables, context: QueryClient) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables, context: QueryClient) => void;
  invalidateKeys?: unknown[][];
}

export function createQueryHook<TData, TParams = void>(config: QueryConfig<TData, TParams>) {
  return (params?: TParams, options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
      queryKey: config.queryKey(params),
      queryFn: () => config.queryFn(params),
      placeholderData: keepPreviousData,
      ...config.options,
      ...options,
    });
  };
}

export function createMutationHook<TData, TVariables>(config: MutationConfig<TData, TVariables>) {
  return (options?: UseMutationOptions<TData, Error, TVariables>) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: config.mutationFn,
      onSuccess: async (data, variables, _context) => {
        // Invalidate specified keys
        if (config.invalidateKeys) {
          await Promise.all(
            config.invalidateKeys.map(key => 
              queryClient.invalidateQueries({ queryKey: key })
            )
          );
        }
        
        // Call custom onSuccess
        await config.onSuccess?.(data, variables, queryClient);
      },
      onError: (error, variables, _context) => {
        config.onError?.(error, variables, queryClient);
      },
      ...options,
    });
  };
}