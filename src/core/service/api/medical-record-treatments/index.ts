export * from './medical-record-treatments.api';
export * from './cache/cache.manager';
export * from './helpers/treatment.helper';

// Re-export hooks dari generator Orval untuk UI
export {
  useMedicalRecordTreatmentsControllerFindAll as useTreatments,
  useMedicalRecordTreatmentsControllerCreate as useCreateTreatment,
  useMedicalRecordTreatmentsControllerUpdate as useUpdateTreatment,
  useMedicalRecordTreatmentsControllerRemove as useRemoveTreatment,
  useMedicalRecordTreatmentsControllerFindOne as useTreatmentDetail,
  useMedicalRecordTreatmentsControllerFindByMedicalRecordId as useTreatmentsByMedicalRecord,
  useMedicalRecordTreatmentsControllerGetTotalByMedicalRecordId as useTreatmentTotal,
  useMedicalRecordTreatmentsControllerGetTopTreatments as useTopTreatments
} from '../../../api/generated/medical-record-treatments/medical-record-treatments';