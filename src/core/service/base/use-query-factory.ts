import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  keepPreviousData, 
  type UseQueryOptions, 
  type UseMutationOptions, 
  type QueryClient,
  type QueryKey
} from '@tanstack/react-query';

export interface QueryConfig<TData, TParams = void> {
  queryKey: (params?: TParams) => readonly unknown[]; 
  queryFn: (params?: TParams) => Promise<TData>;
  options?: Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'>;
}

export interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables, context: QueryClient) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables, context: QueryClient) => void;
  invalidateKeys?: QueryKey[];
}

export function createQueryHook<TData, TParams = void>(config: QueryConfig<TData, TParams>) {
  return (params?: TParams, options?: Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
      queryKey: config.queryKey(params) as QueryKey, 
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
        if (config.invalidateKeys) {
          await Promise.all(
            config.invalidateKeys.map(key => 
              queryClient.invalidateQueries({ queryKey: key })
            )
          );
        }
        await config.onSuccess?.(data, variables, queryClient);
      },
      onError: (error, variables, _context) => {
        config.onError?.(error, variables, queryClient);
      },
      ...options,
    });
  };
}