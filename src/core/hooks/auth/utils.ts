import { useQueryClient } from '@tanstack/react-query';
import { AuthCacheManager } from '../../service/api/auth/cache/cache.manager';

const cacheManager = new AuthCacheManager();

export function usePrefetchAuth() {
  const queryClient = useQueryClient();
  
  return {
    prefetchProfile: () => cacheManager.prefetchProfile(queryClient),
  };
}

export function useInvalidateAuth() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateProfile: () => cacheManager.invalidateProfile(queryClient),
  };
}