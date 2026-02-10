import { treatmentCategoriesValidators } from '../../service/api/treatment-categories/validators/treatment-categories.validators';
import type {
  TreatmentCategoryValidation,
  CreateTreatmentCategoryFormData,
  UpdateTreatmentCategoryFormData,
} from '../../types/treatment-categories/treatment-categories.types';

export function useTreatmentCategoryValidation() {
  return {
    validateCreate: (data: CreateTreatmentCategoryFormData): TreatmentCategoryValidation =>
      treatmentCategoriesValidators.validateCreate(data),
    validateUpdate: (data: UpdateTreatmentCategoryFormData): TreatmentCategoryValidation =>
      treatmentCategoriesValidators.validateUpdate(data),
  };
}