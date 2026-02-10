/**
 * Treatment Categories API Module
 * 
 * This module provides a clean API for managing treatment categories.
 * It's refactored to separate concerns:
 * - Service: Core API calls
 * - Helpers: Utility functions
 * - Validators: Data validation
 * - Cache Manager: React Query cache management
 */

export {
  treatmentCategoriesService,
  TreatmentCategoriesService
} from './treatment-categories.api';

export {
  treatmentCategoriesHelpers,
  TreatmentCategoriesHelpers
} from './helpers/treatment-categories.helpers';

export {
  treatmentCategoriesValidators,
  TreatmentCategoriesValidators
} from './validators/treatment-categories.validators';

export {
  treatmentCategoriesCacheManager,
  TreatmentCategoriesCacheManager
} from './cache/cache.manager';

// Re-export generated hooks
export {
  useTreatmentCategoriesControllerCreate,
  useTreatmentCategoriesControllerFindAll,
  useTreatmentCategoriesControllerFindOne,
  useTreatmentCategoriesControllerUpdate,
  useTreatmentCategoriesControllerRemove,
  useTreatmentCategoriesControllerRestore
} from '../../../api/generated/treatment-categories/treatment-categories';

// Re-export query keys
export {
  getTreatmentCategoriesControllerFindAllQueryKey,
  getTreatmentCategoriesControllerFindOneQueryKey
} from '../../../api/generated/treatment-categories/treatment-categories';

// Re-export types
export type {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoriesControllerFindAllParams,
  TreatmentCategoryResponseDto
} from '../../../api/model';

export type {
  TreatmentCategory,
  TreatmentCategoryPaginatedResponse,
  CreateTreatmentCategoryFormData,
  UpdateTreatmentCategoryFormData,
  TreatmentCategoryFilters,
  TreatmentCategoryValidation,
  TreatmentCategoryOption,
  TreatmentCategorySummary,
  TreatmentCategoryStatus,
  TreatmentCategoryWithStatus
} from '../../../types/treatment-categories/treatment-categories.types';