import { createQueryHook } from '../../service/base/use-query-factory';
import { authService } from '../../service/api/auth/auth.api';
import { AuthCacheManager } from '../../service/api/auth/cache/cache.manager';

const cacheManager = new AuthCacheManager();

export const useUserProfile = createQueryHook({
  queryKey: () => cacheManager.getProfileQueryKey(),
  queryFn: () => authService.getProfile(),
  options: {
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  },
});