/**
 * Uploads API Module
 * 
 * This module provides a clean API for file uploads.
 * It's refactored to separate concerns:
 * - Service: Core API calls
 * - Helpers: Utility functions
 * - Validators: File validation
 * - Cache Manager: React Query cache management
 */

export {
  uploadsService,
  UploadsService
} from './uploads.api';

export {
  uploadsHelpers,
  UploadsHelpers
} from './helpers/uploads.helpers';

export {
  uploadsValidators,
  UploadsValidators
} from './validators/uploads.validators';

export {
  uploadsCacheManager,
  UploadsCacheManager
} from './cache/cache.manager';

// Re-export generated hooks
export {
  useUploadsControllerUploadFile
} from '../../../api/generated/uploads/uploads';

// Re-export types
export type { UploadResponse } from './uploads.api';
export type { ValidationError, FileValidation } from './validators/uploads.validators';