/**
 * Treatments API Module
 * 
 * This module provides a clean API for managing treatments.
 * It's refactored to separate concerns:
 * - Service: Core API calls
 * - Helpers: Utility functions
 * - Validators: Data validation
 * - Cache Manager: React Query cache management
 */

export {
  treatmentsService,
  TreatmentsService
} from './treatment.api';

export {
  treatmentsHelpers,
  TreatmentsHelpers
} from './helpers/treatments.helpers';

export {
  treatmentsValidators,
  TreatmentsValidators
} from './validators/treatments.validators';

export {
  treatmentsCacheManager,
  TreatmentsCacheManager
} from './cache/cache.manager';

// Re-export generated hooks
export {
  useTreatmentsControllerFindAll,
  useTreatmentsControllerCreate,
  useTreatmentsControllerUpdate,
  useTreatmentsControllerRemove,
  useTreatmentsControllerRestore,
  useTreatmentsControllerActivate,
  useTreatmentsControllerDeactivate,
  useTreatmentsControllerFindOne,
  useTreatmentsControllerFindByKode
} from '../../../api/generated/treatments/treatments';

// Re-export query keys
export {
  getTreatmentsControllerFindAllQueryKey,
  getTreatmentsControllerFindOneQueryKey,
  getTreatmentsControllerFindByKodeQueryKey
} from '../../../api/generated/treatments/treatments';

// Re-export types
export type {
  CreateTreatmentDto,
  UpdateTreatmentDto,
  TreatmentQueryParams,
  Treatment,
  PaginatedTreatmentResponse,
} from '../../../types/treatments/treatment.types';

export type {
  ValidationError,
  TreatmentValidation
} from './validators/treatments.validators';