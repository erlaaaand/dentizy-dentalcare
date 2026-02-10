export {
  useTreatments,
  useTreatment,
  useTreatmentByKode,
} from './queries';

export {
  useCreateTreatment,
  useUpdateTreatment,
  useRemoveTreatment,
  useRestoreTreatment,
  useActivateTreatment,
  useDeactivateTreatment,
} from './mutations';

export {
  useTreatmentMutations,
  useTreatmentStatusToggle,
} from './combined';

export {
  usePrefetchTreatment,
  useInvalidateTreatments,
} from './utils';