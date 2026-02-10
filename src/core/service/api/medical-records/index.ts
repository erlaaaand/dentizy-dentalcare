export * from './medical-record.api';
export * from './cache/cache.manager';
export * from './helpers/medical-record.helper';

// Re-export hooks dari generator Orval untuk UI
export {
  useMedicalRecordsControllerCreate as useCreateMedicalRecord,
  useMedicalRecordsControllerFindAll as useMedicalRecords,
  useMedicalRecordsControllerSearch as useSearchMedicalRecords,
  useMedicalRecordsControllerFindByAppointmentId as useMedicalRecordByAppointment,
  useMedicalRecordsControllerGetDoctorStats as useDoctorStats,
  useMedicalRecordsControllerFindOne as useMedicalRecordDetail,
  useMedicalRecordsControllerUpdate as useUpdateMedicalRecord,
  useMedicalRecordsControllerRemove as useRemoveMedicalRecord,
  useMedicalRecordsControllerRestore as useRestoreMedicalRecord,
  useMedicalRecordsControllerHardDelete as useHardDeleteMedicalRecord
} from '../../../api/generated/medical-records/medical-records';