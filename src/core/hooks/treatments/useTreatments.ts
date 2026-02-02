import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  useTreatmentsControllerFindAll,
  useTreatmentsControllerCreate,
  useTreatmentsControllerUpdate,
  useTreatmentsControllerRemove,
  useTreatmentsControllerRestore,
  useTreatmentsControllerActivate,
  useTreatmentsControllerDeactivate,
  useTreatmentsControllerFindOne,
  useTreatmentsControllerFindByKode
} from '../../api/generated/treatments/treatments';
import type { TreatmentQueryParams } from '../../types/treatments/treatment.types';

/**
 * Hook untuk mendapatkan daftar treatments dengan pagination dan filter
 */
export const useTreatments = (params?: TreatmentQueryParams) => {
  return useTreatmentsControllerFindAll(params, {
    query: { placeholderData: keepPreviousData }
  });
};

/**
 * Hook untuk mendapatkan detail treatment berdasarkan ID
 */
export const useTreatmentDetail = (id: number) => {
  return useTreatmentsControllerFindOne(id, {
    query: { enabled: !!id }
  });
};

/**
 * Hook untuk mendapatkan treatment berdasarkan kode
 */
export const useTreatmentByKode = (kode: string) => {
  return useTreatmentsControllerFindByKode(kode, {
    query: { enabled: !!kode && kode.length > 0 }
  });
};

/**
 * Hook untuk semua operasi mutasi treatment
 */
export const useTreatmentMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['/treatments'] });

  const create = useTreatmentsControllerCreate({ 
    mutation: { onSuccess: invalidate } 
  });
  
  const update = useTreatmentsControllerUpdate({ 
    mutation: { onSuccess: invalidate } 
  });
  
  const remove = useTreatmentsControllerRemove({ 
    mutation: { onSuccess: invalidate } 
  });

  const restore = useTreatmentsControllerRestore({
    mutation: { onSuccess: invalidate }
  });
  
  const activate = useTreatmentsControllerActivate({ 
    mutation: { onSuccess: invalidate } 
  });
  
  const deactivate = useTreatmentsControllerDeactivate({ 
    mutation: { onSuccess: invalidate } 
  });

  return {
    createTreatment: create.mutate,
    createTreatmentAsync: create.mutateAsync,
    updateTreatment: update.mutate,
    updateTreatmentAsync: update.mutateAsync,
    deleteTreatment: remove.mutate,
    deleteTreatmentAsync: remove.mutateAsync,
    restoreTreatment: restore.mutate,
    restoreTreatmentAsync: restore.mutateAsync,
    activateTreatment: activate.mutate,
    activateTreatmentAsync: activate.mutateAsync,
    deactivateTreatment: deactivate.mutate,
    deactivateTreatmentAsync: deactivate.mutateAsync,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
    isRestoring: restore.isPending,
    isActivating: activate.isPending,
    isDeactivating: deactivate.isPending,
  };
};

/**
 * Hook untuk toggle status aktif treatment
 * @param onSuccess - Callback function setelah berhasil toggle status
 */
export const useTreatmentStatusToggle = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['/treatments'] });
    onSuccess?.();
  };

  const activate = useTreatmentsControllerActivate({ 
    mutation: { onSuccess: invalidate } 
  });
  
  const deactivate = useTreatmentsControllerDeactivate({ 
    mutation: { onSuccess: invalidate } 
  });

  const toggleStatus = async (id: number, isActive: boolean) => {
    if (isActive) {
      return activate.mutateAsync({ id });
    } else {
      return deactivate.mutateAsync({ id });
    }
  };

  return {
    toggleStatus,
    isToggling: activate.isPending || deactivate.isPending,
  };
};