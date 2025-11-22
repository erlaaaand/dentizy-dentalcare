// frontend/src/core/services/api/medicalRecord.api.ts
import {
  useMedicalRecordsControllerCreate,
  useMedicalRecordsControllerFindAll,
  useMedicalRecordsControllerSearch,
  useMedicalRecordsControllerFindOne,
  useMedicalRecordsControllerFindByAppointmentId,
  useMedicalRecordsControllerUpdate,
  useMedicalRecordsControllerRemove,
  useMedicalRecordsControllerRestore,
  useMedicalRecordsControllerHardDelete,
} from '@/core/api/generated/medical-records/medical-records';

export {
  useMedicalRecordsControllerCreate as useCreateMedicalRecord,
  useMedicalRecordsControllerFindAll as useGetMedicalRecords,
  useMedicalRecordsControllerSearch as useSearchMedicalRecords,
  useMedicalRecordsControllerFindOne as useGetMedicalRecord,
  useMedicalRecordsControllerFindByAppointmentId as useGetMedicalRecordByAppointment,
  useMedicalRecordsControllerUpdate as useUpdateMedicalRecord,
  useMedicalRecordsControllerRemove as useDeleteMedicalRecord,
  useMedicalRecordsControllerRestore as useRestoreMedicalRecord,
  useMedicalRecordsControllerHardDelete as useHardDeleteMedicalRecord,
};

// Re-export types
export type {
  MedicalRecordResponseDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordsControllerFindAllParams,
  MedicalRecordsControllerSearchParams,
} from '@/core/api/model';