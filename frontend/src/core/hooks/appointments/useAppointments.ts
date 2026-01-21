import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { 
  useAppointmentsControllerFindAll,
  useAppointmentsControllerCreate,
  useAppointmentsControllerUpdate,
  useAppointmentsControllerCancel,
  useAppointmentsControllerComplete
} from '../../api/generated/appointments/appointments';
import { AppointmentQueryParams } from '../../types/appointments/appointment.types';

export const useAppointments = (params?: AppointmentQueryParams) => {
  return useAppointmentsControllerFindAll(params, {
    query: {
      placeholderData: keepPreviousData,
    }
  });
};

export const useAppointmentMutations = () => {
  const queryClient = useQueryClient();
  const invalidateList = () => queryClient.invalidateQueries({ queryKey: ['/appointments'] });

  const create = useAppointmentsControllerCreate({
    mutation: { onSuccess: invalidateList }
  });

  const update = useAppointmentsControllerUpdate({
    mutation: { onSuccess: invalidateList }
  });

  const cancel = useAppointmentsControllerCancel({
    mutation: { onSuccess: invalidateList }
  });

  const complete = useAppointmentsControllerComplete({
    mutation: { onSuccess: invalidateList }
  });

  return {
    createAppointment: create.mutate,
    updateAppointment: update.mutate,
    cancelAppointment: cancel.mutate,
    completeAppointment: complete.mutate,
    isCreating: create.isPending,
    isUpdating: update.isPending
  };
};