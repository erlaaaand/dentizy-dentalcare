import {
  treatmentsControllerFindAll,
  treatmentsControllerCreate,
  treatmentsControllerUpdate,
  treatmentsControllerRemove,
  treatmentsControllerActivate,
  treatmentsControllerDeactivate
} from '../../../api/generated/treatments/treatments';
import { CreateTreatmentDto, UpdateTreatmentDto, TreatmentQueryParams } from '../../../types/treatments/treatment.types';

export const TreatmentApi = {
  getAll: async (params?: TreatmentQueryParams) => await treatmentsControllerFindAll(params),
  create: async (data: CreateTreatmentDto) => await treatmentsControllerCreate(data),
  update: async (id: number, data: UpdateTreatmentDto) => await treatmentsControllerUpdate(id, data),
  remove: async (id: number) => await treatmentsControllerRemove(id),
  toggleStatus: async (id: number, isActive: boolean) => {
    return isActive 
      ? await treatmentsControllerActivate(id)
      : await treatmentsControllerDeactivate(id);
  }
};