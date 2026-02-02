/**
 * Appointment hooks.
 *
 * Consumes the orval-generated React-Query hooks and re-exports them
 * under stable, domain-friendly names.  Cache invalidation is
 * centralised in `useAppointmentMutations` so every mutation
 * automatically keeps the list & detail queries fresh.
 */

import { useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  useAppointmentsControllerFindAll,
  useAppointmentsControllerFindOne,
  useAppointmentsControllerCreate,
  useAppointmentsControllerUpdate,
  useAppointmentsControllerCancel,
  useAppointmentsControllerComplete,
  useAppointmentsControllerRemove,
  getAppointmentsControllerFindAllQueryKey,
  getAppointmentsControllerFindOneQueryKey,
} from '../../api/generated/appointments/appointments';

import type { AppointmentQueryParams } from '../../types/appointments/appointment.types';

// ---------------------------------------------------------------------------
// Query key helpers – re-exported so components can use them for
// manual invalidation or optimistic updates if needed.
// ---------------------------------------------------------------------------
export { getAppointmentsControllerFindAllQueryKey as appointmentListQueryKey };
export { getAppointmentsControllerFindOneQueryKey as appointmentDetailQueryKey };

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Hook untuk mengambil daftar appointment dengan pagination & filter.
 * Menggunakan `keepPreviousData` agar UI tidak flash kosong saat
 * perpagination atau perubahan filter.
 */
export const useAppointments = (params?: AppointmentQueryParams) => {
  return useAppointmentsControllerFindAll(params, {
    query: {
      placeholderData: keepPreviousData,
    },
  });
};

/**
 * Hook untuk mengambil detail satu appointment berdasarkan ID.
 * Query otomatis disabled ketika `id` kosong / undefined.
 */
export const useAppointmentById = (id: string | undefined) => {
  return useAppointmentsControllerFindOne(id ?? '', {
    query: {
      enabled: !!id,
    },
  });
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Hook gabungan semua mutasi appointment.
 *
 * Setiap mutasi yang berhasil akan otomatis menginvalidasi:
 *  - seluruh cache list (`/appointments`)
 *  - cache detail spesifik (`/appointments/:id`) – untuk update, cancel,
 *    complete, dan remove.
 *
 * Ini memastikan UI selalu sinkron tanpa perlu refetch manual di masing-
 * masing komponen.
 */
export const useAppointmentMutations = () => {
  const queryClient = useQueryClient();

  /** Invalidasi seluruh list appointment. */
  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: getAppointmentsControllerFindAllQueryKey(),
    });

  /** Invalidasi detail appointment tertentu sekaligus list. */
  const invalidateById = (id: string) => {
    queryClient.invalidateQueries({
      queryKey: getAppointmentsControllerFindOneQueryKey(id),
    });
    invalidateList();
  };

  // --- Create -----------------------------------------------------------
  const create = useAppointmentsControllerCreate({
    mutation: {
      onSuccess: invalidateList,
    },
  });

  // --- Update -----------------------------------------------------------
  const update = useAppointmentsControllerUpdate({
    mutation: {
      onSuccess: (_data, variables) => invalidateById(variables.id),
    },
  });

  // --- Cancel -----------------------------------------------------------
  const cancel = useAppointmentsControllerCancel({
    mutation: {
      onSuccess: (_data, variables) => invalidateById(variables.id),
    },
  });

  // --- Complete ---------------------------------------------------------
  const complete = useAppointmentsControllerComplete({
    mutation: {
      onSuccess: (_data, variables) => invalidateById(variables.id),
    },
  });

  // --- Remove -----------------------------------------------------------
  const remove = useAppointmentsControllerRemove({
    mutation: {
      onSuccess: (_data, variables) => {
        // Detail query tidak perlu diinvalidasi karena record sudah terhapus;
        // cukup buang dari cache dan invalidasi list.
        queryClient.removeQueries({
          queryKey: getAppointmentsControllerFindOneQueryKey(variables.id),
        });
        invalidateList();
      },
    },
  });

  // --- Exposed interface ------------------------------------------------
  return {
    // Mutation functions
    createAppointment: create.mutateAsync,
    updateAppointment: update.mutateAsync,
    cancelAppointment: cancel.mutateAsync,
    completeAppointment: complete.mutateAsync,
    removeAppointment: remove.mutateAsync,

    // Loading states
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isCancelling: cancel.isPending,
    isCompleting: complete.isPending,
    isRemoving: remove.isPending,

    // Derived: true selama mutasi apa pun sedang berjalan
    isMutating:
      create.isPending ||
      update.isPending ||
      cancel.isPending ||
      complete.isPending ||
      remove.isPending,
  };
};