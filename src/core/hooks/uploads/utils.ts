import { useQueryClient } from '@tanstack/react-query';
import { UploadsCacheManager } from '../../service/api/uploads/cache/cache.manager';

const cacheManager = new UploadsCacheManager();

export function useInvalidateUploads() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
  };
}