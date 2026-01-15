// frontend/src/core/services/api/patient.api.ts
import {
  usePatientsControllerCreate,
  usePatientsControllerFindAll,
  usePatientsControllerSearch,
  usePatientsControllerFindOne,
  usePatientsControllerFindByNik,
  usePatientsControllerFindByMedicalRecordNumber,
  usePatientsControllerUpdate,
  usePatientsControllerRemove,
  usePatientsControllerRestore,
  usePatientsControllerGetStatistics,
} from '@/core/api/generated/patients/patients';

export {
  usePatientsControllerCreate as useCreatePatient,
  usePatientsControllerFindAll as useGetPatients,
  usePatientsControllerSearch as useSearchPatients,
  usePatientsControllerFindOne as useGetPatient,
  usePatientsControllerFindByNik as useGetPatientByNik,
  usePatientsControllerFindByMedicalRecordNumber as useGetPatientByMRN,
  usePatientsControllerUpdate as useUpdatePatient,
  usePatientsControllerRemove as useDeletePatient,
  usePatientsControllerRestore as useRestorePatient,
  usePatientsControllerGetStatistics as useGetPatientStatistics,
};

// Re-export types
export type {
  PatientResponseDto,
  CreatePatientDto,
  UpdatePatientDto,
  PatientsControllerFindAllParams,
  PatientsControllerSearchParams,
} from '@/core/api/model';