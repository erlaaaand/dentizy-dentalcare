import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

// API & Models
import {
  usePatientsControllerFindAll,
  usePatientsControllerCreate,
  usePatientsControllerUpdate,
  usePatientsControllerRemove,
  getPatientsControllerFindAllQueryKey,
} from '../../api/generated/patients/patients';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientsControllerFindAllParams,
} from '../../api/model';

// Hooks & Utils
import { useToast } from '../toasts/useToast';
import { useDebounce } from '../utils/useDebounce';
import { usePagination } from '../utils/usePagination';
import { ApiErrorResponse } from '../../types/api.types';

export const usePatients = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // --- Local State untuk Filtering ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { page, limit, onPageChange, onLimitChange } = usePagination();

  // --- Query Params Construction ---
  const queryParams: PatientsControllerFindAllParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    sortBy: 'nama_lengkap',          // sesuai enum PatientsControllerFindAllSortBy
    sortOrder: 'asc',        // sesuai enum PatientsControllerFindAllSortOrder
    jenis_kelamin: 'L',   // sesuai enum PatientsControllerFindAllJenisKelamin
    is_active: true,
    // search?: string;
    // page?: number;
    // limit?: number;
    // sortBy?: PatientsControllerFindAllSortBy;
    // sortOrder?: PatientsControllerFindAllSortOrder;
    // jenis_kelamin?: PatientsControllerFindAllJenisKelamin;
    umur_min: 0,
    umur_max: 100,
    tanggal_daftar_dari: '',
    tanggal_daftar_sampai: '',
    // doctor_id?: ''
    };

  // --- 1. Fetch List Pasien ---
  const {
    data: patientsData,
    isLoading,
    isError,
    refetch,
  } = usePatientsControllerFindAll(queryParams, {
    query: {
      placeholderData: (prev) => prev, // Keep data saat loading page baru
    },
  });

  // --- 2. Create Patient ---
  const createMutation = usePatientsControllerCreate({
    mutation: {
      onSuccess: () => {
        showSuccess('Pasien berhasil didaftarkan');
        queryClient.invalidateQueries({ queryKey: getPatientsControllerFindAllQueryKey(queryParams) });
      },
      onError: (error: AxiosError<ApiErrorResponse>) => {
        const msg = error.response?.data?.message || 'Gagal membuat pasien';
        showError(Array.isArray(msg) ? msg[0] : msg);
      },
    },
  });

  // --- 3. Update Patient ---
  const updateMutation = usePatientsControllerUpdate({
    mutation: {
      onSuccess: () => {
        showSuccess('Data pasien diperbarui');
        queryClient.invalidateQueries({ queryKey: getPatientsControllerFindAllQueryKey(queryParams) });
      },
      onError: (error: AxiosError<ApiErrorResponse>) => {
        const msg = error.response?.data?.message || 'Gagal update pasien';
        showError(Array.isArray(msg) ? msg[0] : msg);
      },
    },
  });

  // --- 4. Delete Patient ---
  const deleteMutation = usePatientsControllerRemove({
    mutation: {
      onSuccess: () => {
        showSuccess('Pasien dihapus');
        queryClient.invalidateQueries({ queryKey: getPatientsControllerFindAllQueryKey(queryParams) });
      },
      onError: (error: AxiosError<ApiErrorResponse>) => {
        const msg = error.response?.data?.message || 'Gagal menghapus pasien';
        showError(Array.isArray(msg) ? msg[0] : msg);
      },
    },
  });

  return {
    // Data & Status
    patients: patientsData?.data || [],
    meta: patientsData?.data ? { ...patientsData.data } : null, // Asumsi ada meta pagination di response
    isLoading,
    isError,
    
    // Actions
    refetch,
    createPatient: (data: CreatePatientDto) => createMutation.mutate({ data }),
    updatePatient: (id: string, data: UpdatePatientDto) => updateMutation.mutate({ id, data }),
    deletePatient: (id: string) => deleteMutation.mutate({ id }),
    
    // State Management Helper
    pagination: {
      page,
      limit,
      onPageChange,
      onLimitChange,
    },
    search: {
      value: searchQuery,
      onChange: setSearchQuery,
    },
    
    // Loading States untuk Button
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};