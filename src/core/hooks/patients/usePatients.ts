export {
  usePatients,
  usePatient,
  usePatientSearch,
  usePatientStatistics,
  usePatientByMedicalRecordNumber,
  usePatientByNik,
  usePatientsByDoctor,
} from './queries';

export {
  useCreatePatient,
  useUpdatePatient,
  useRemovePatient,
  useActivatePatient,
  useRestorePatient,
} from './mutations';

export { usePatientMutations } from './combined';

export {
  usePrefetchPatient,
  useInvalidatePatients,
} from './utils';