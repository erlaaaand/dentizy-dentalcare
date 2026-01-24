import {
  patientsControllerFindAll,
  patientsControllerCreate,
  patientsControllerFindOne,
  patientsControllerUpdate,
  patientsControllerRemove,
  patientsControllerSearch
} from '../../../api/generated/patients/patients';
import { 
  CreatePatientDto, 
  UpdatePatientDto, 
  PatientQueryParams, 
  PatientSearchParams 
} from '../../../types/patients/patient.types';

export const PatientService = {
  getAll: async (params?: PatientQueryParams) => {
    return await patientsControllerFindAll(params);
  },

  getById: async (id: string) => {
    return await patientsControllerFindOne(id);
  },

  create: async (data: CreatePatientDto) => {
    return await patientsControllerCreate(data);
  },

  update: async (id: string, data: UpdatePatientDto) => {
    return await patientsControllerUpdate(id, data);
  },

  delete: async (id: string) => {
    return await patientsControllerRemove(id);
  },

  search: async (params: PatientSearchParams) => {
    return await patientsControllerSearch(params);
  }
};