export {
  useAppointments,
  useAppointment,
} from './queries';

export {
  useCreateAppointment,
  useUpdateAppointment,
  useCompleteAppointment,
  useCancelAppointment,
  useDeleteAppointment,
} from './mutations';

export { useAppointmentMutations } from './combined';

export {
  usePrefetchAppointment,
  useInvalidateAppointments,
} from './utils';

export { appointmentsService } from '../../service/api/appointments/appointment.api';