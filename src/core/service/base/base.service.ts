import type { QueryClient } from '@tanstack/react-query';

export abstract class BaseService {
  protected invalidateQueries(queryClient: QueryClient, queryKey: unknown[]) {
    return queryClient.invalidateQueries({ queryKey });
  }

  protected prefetchQuery<T>(
    queryClient: QueryClient, 
    queryKey: unknown[], 
    queryFn: () => Promise<T>
  ) {
    return queryClient.prefetchQuery({ queryKey, queryFn });
  }

  protected removeQueries(queryClient: QueryClient, queryKey: unknown[]) {
    return queryClient.removeQueries({ queryKey });
  }

  protected setQueryData<T>(queryClient: QueryClient, queryKey: unknown[], data: T) {
    return queryClient.setQueryData(queryKey, data);
  }

  protected getQueryData<T>(queryClient: QueryClient, queryKey: unknown[]): T | undefined {
    return queryClient.getQueryData(queryKey);
  }
}