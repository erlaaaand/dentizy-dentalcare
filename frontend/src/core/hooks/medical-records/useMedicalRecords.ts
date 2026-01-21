import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  useMedicalRecordsControllerFindAll,
  useMedicalRecordsControllerSearch,
  useMedicalRecordsControllerCreate,
  useMedicalRecordsControllerUpdate,
  useMedicalRecordsControllerFindOne,
  useMedicalRecordsControllerFindByAppointmentId
} from '../../api/generated/medical-records/medical-records';
import { MedicalRecordQueryParams, MedicalRecordSearchParams } from '../../types/medical-records/medical-record.types';

export const useMedicalRecords = (params?: MedicalRecordQueryParams) => {
  return useMedicalRecordsControllerFindAll(params, {
    query: { placeholderData: keepPreviousData }
  });
};

export const useMedicalRecord = (id: string) => {
  return useMedicalRecordsControllerFindOne(id, {
    query: { enabled: !!id }
  });
};

export const useMedicalRecordSearch = (params?: MedicalRecordSearchParams) => {
  return useMedicalRecordsControllerSearch(params, {
    query: { 
      enabled: !!params && Object.keys(params).length > 0,
    }
  });
};

export const useMedicalRecordByAppointment = (appointmentId: string) => {
  return useMedicalRecordsControllerFindByAppointmentId(appointmentId, {
    query: { enabled: !!appointmentId }
  });
};

export const useMedicalRecordMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['/medical-records'] });
    queryClient.invalidateQueries({ queryKey: ['/appointments'] });
  };

  const create = useMedicalRecordsControllerCreate({ mutation: { onSuccess: invalidate } });
  const update = useMedicalRecordsControllerUpdate({ mutation: { onSuccess: invalidate } });

  return {
    createMedicalRecord: create.mutate,
    updateMedicalRecord: update.mutate,
    isCreating: create.isPending,
    isUpdating: update.isPending
  };
};