import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Uploads Cache Manager
 * Manages React Query cache for uploads
 * Extends BaseService for common cache operations
 */
export class UploadsCacheManager extends BaseService {
  /**
   * Invalidate all upload queries
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, ['/uploads'] as const);
  }

  /**
   * Clear all upload-related cache
   */
  clearAll(queryClient: QueryClient): void {
    this.removeQueries(queryClient, ['/uploads'] as const);
  }
}

export const uploadsCacheManager = new UploadsCacheManager();