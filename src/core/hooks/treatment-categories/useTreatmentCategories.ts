export {
  useTreatmentCategories,
  useTreatmentCategory,
} from './queries';

export {
  useCreateTreatmentCategory,
  useUpdateTreatmentCategory,
  useRemoveTreatmentCategory,
  useRestoreTreatmentCategory,
} from './mutations';

export { useTreatmentCategoryValidation } from './validation';

export { useTreatmentCategoryMutations } from './combined';

export {
  usePrefetchTreatmentCategories,
  useInvalidateTreatmentCategories,
} from './utils';

// Re-export helpers & types
export { treatmentCategoriesHelpers } from '../../service/api/treatment-categories/helpers/treatment-categories.helpers';
export type {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoryValidation,
  CreateTreatmentCategoryFormData,
  UpdateTreatmentCategoryFormData,
} from '../../types/treatment-categories/treatment-categories.types';