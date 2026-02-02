import {
  treatmentsControllerFindAll,
  treatmentsControllerCreate,
  treatmentsControllerUpdate,
  treatmentsControllerRemove,
  treatmentsControllerRestore,
  treatmentsControllerActivate,
  treatmentsControllerDeactivate,
  treatmentsControllerFindOne,
  treatmentsControllerFindByKode
} from '../../../api/generated/treatments/treatments';
import type { 
  CreateTreatmentDto, 
  UpdateTreatmentDto, 
  TreatmentQueryParams 
} from '../../../types/treatments/treatment.types';

export const TreatmentApi = {
  // CRUD operations
  findAll: async (params?: TreatmentQueryParams) => await treatmentsControllerFindAll(params),
  findOne: async (id: number) => await treatmentsControllerFindOne(id),
  findByKode: async (kode: string) => await treatmentsControllerFindByKode(kode),
  create: async (data: CreateTreatmentDto) => await treatmentsControllerCreate(data),
  update: async (id: number, data: UpdateTreatmentDto) => await treatmentsControllerUpdate(id, data),
  remove: async (id: number) => await treatmentsControllerRemove(id),
  
  // Soft delete management
  restore: async (id: number) => await treatmentsControllerRestore(id),
  
  // Status management
  activate: async (id: number) => await treatmentsControllerActivate(id),
  deactivate: async (id: number) => await treatmentsControllerDeactivate(id),
  toggleStatus: async (id: number, isActive: boolean) => {
    return isActive 
      ? await treatmentsControllerActivate(id)
      : await treatmentsControllerDeactivate(id);
  }
};