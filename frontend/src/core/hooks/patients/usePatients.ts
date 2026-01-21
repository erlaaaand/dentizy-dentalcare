// src/hooks/usePatients.ts
import { 
  usePatientsControllerFindAll, 
  usePatientsControllerCreate, 
  usePatientsControllerFindOne,
  usePatientsControllerUpdate,
  usePatientsControllerRemove
} from '.././../api/generated/patients/patients';
import { PatientQueryParams } from '../../types/patients/patient.types';
import { useQueryClient, keepPreviousData } from '@tanstack/react-query';

// Hook untuk mengambil list pasien
export const usePatients = (params?: PatientQueryParams) => {
  return usePatientsControllerFindAll(params, {
    query: {
      placeholderData: keepPreviousData,
    }
  });
};

// Hook untuk detail satu pasien
export const usePatientDetail = (id: string) => {
  return usePatientsControllerFindOne(id, {
    query: {
      enabled: !!id, // Hanya fetch jika ID ada
    }
  });
};

// Hook untuk mutasi (Create, Update, Delete)
export const usePatientMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = usePatientsControllerCreate({
    mutation: {
      onSuccess: () => {
        // Refresh list pasien setelah create
        queryClient.invalidateQueries({ queryKey: ['/patients'] });
      }
    }
  });

  const updateMutation = usePatientsControllerUpdate({
    mutation: {
      onSuccess: (_, variables) => {
        // Refresh detail pasien dan list
        queryClient.invalidateQueries({ queryKey: ['/patients'] });
        queryClient.invalidateQueries({ queryKey: [`/patients/${variables.id}`] });
      }
    }
  });

  const deleteMutation = usePatientsControllerRemove({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/patients'] });
      }
    }
  });

  return {
    createPatient: createMutation.mutate,
    createPending: createMutation.isPending,
    updatePatient: updateMutation.mutate,
    updatePending: updateMutation.isPending,
    deletePatient: deleteMutation.mutate,
    deletePending: deleteMutation.isPending,
  };
};