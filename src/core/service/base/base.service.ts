import type { QueryClient, QueryKey } from '@tanstack/react-query';

export abstract class BaseService {
  protected invalidateQueries(queryClient: QueryClient, queryKey: readonly unknown[]) {
    return queryClient.invalidateQueries({ queryKey: queryKey as QueryKey });
  }

  protected prefetchQuery<T>(
    queryClient: QueryClient, 
    queryKey: readonly unknown[], 
    queryFn: () => Promise<T>
  ) {
    return queryClient.prefetchQuery({ queryKey: queryKey as QueryKey, queryFn });
  }

  public removeQueries(queryClient: QueryClient, queryKey: readonly unknown[]) {
    return queryClient.removeQueries({ queryKey: queryKey as QueryKey });
  }

  protected setQueryData<T>(queryClient: QueryClient, queryKey: readonly unknown[], data: T) {
    return queryClient.setQueryData(queryKey as QueryKey, data);
  }

  protected getQueryData<T>(queryClient: QueryClient, queryKey: readonly unknown[]): T | undefined {
    return queryClient.getQueryData(queryKey as QueryKey);
  }
}