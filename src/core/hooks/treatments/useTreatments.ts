import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  useTreatmentsControllerFindAll,
  useTreatmentsControllerCreate,
  useTreatmentsControllerUpdate,
  useTreatmentsControllerRemove,
  useTreatmentsControllerActivate,
  useTreatmentsControllerDeactivate
} from '../../api/generated/treatments/treatments';
import { TreatmentQueryParams } from '../../types/treatments/treatment.types';

export const useTreatments = (params?: TreatmentQueryParams) => {
  return useTreatmentsControllerFindAll(params, {
    query: { placeholderData: keepPreviousData }
  });
};

export const useTreatmentMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['/treatments'] });

  const create = useTreatmentsControllerCreate({ mutation: { onSuccess: invalidate } });
  const update = useTreatmentsControllerUpdate({ mutation: { onSuccess: invalidate } });
  const remove = useTreatmentsControllerRemove({ mutation: { onSuccess: invalidate } });
  const activate = useTreatmentsControllerActivate({ mutation: { onSuccess: invalidate } });
  const deactivate = useTreatmentsControllerDeactivate({ mutation: { onSuccess: invalidate } });

  return {
    createTreatment: create.mutate,
    updateTreatment: update.mutate,
    deleteTreatment: remove.mutate,
    activateTreatment: activate.mutate,
    deactivateTreatment: deactivate.mutate,
  };
};