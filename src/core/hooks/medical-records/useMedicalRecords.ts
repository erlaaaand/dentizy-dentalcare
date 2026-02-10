export {
  useMedicalRecords,
  useMedicalRecord,
  useMedicalRecordSearch,
  useMedicalRecordByAppointment,
  useDoctorStats,
} from './queries';

export {
  useCreateMedicalRecord,
  useUpdateMedicalRecord,
  useRemoveMedicalRecord,
  useRestoreMedicalRecord,
  useHardDeleteMedicalRecord,
} from './mutations';

export { useMedicalRecordMutations } from './combined';

export {
  usePrefetchMedicalRecord,
  useInvalidateMedicalRecords,
} from './utils';