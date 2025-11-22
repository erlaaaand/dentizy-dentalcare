import { useQuery as useTanstackQuery, UseQueryOptions } from '@tanstack/react-query';
import { ApiResponse } from '../../types/api';
import { ErrorHandler } from '../../errors/error.handler';

export function useQuery<TData = unknown, TError = Error>(
  queryKey: any[],
  queryFn: () => Promise<ApiResponse<TData>>,
  options?: Omit<UseQueryOptions<ApiResponse<TData>, TError, TData>, 'queryKey' | 'queryFn'>
) {
  return useTanstackQuery({
    queryKey,
    queryFn,
    select: (response) => response.data,
    onError: (error) => {
      ErrorHandler.logError(error);
    },
    ...options,
  });
}