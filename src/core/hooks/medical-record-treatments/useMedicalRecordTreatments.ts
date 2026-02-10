export {
  useMedicalRecordTreatments,
  useMedicalRecordTreatment,
  useMedicalRecordTreatmentsByRecordId,
  useMedicalRecordTreatmentTotal,
  useTopTreatments,
} from './queries';

export {
  useCreateMedicalRecordTreatment,
  useUpdateMedicalRecordTreatment,
  useRemoveMedicalRecordTreatment,
} from './mutations';

export {
  useMedicalRecordTreatmentMutations,
  useMedicalRecordTreatmentManager,
} from './combined';

export {
  usePrefetchMedicalRecordTreatment,
  useInvalidateMedicalRecordTreatments,
} from './utils';