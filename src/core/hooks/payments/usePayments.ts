import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { paymentsService } from '../../service/api/payments/payments.api';
import { paymentsHelpers } from '../../service/api/payments/helpers/payment.helper';
import { paymentsValidators } from '../../service/api/payments/validators/payments.validators';
import { PaymentsCacheManager } from '../../service/api/payments/cache/cache.manager';
import type {
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  PaymentValidation,
  CreatePaymentFormData,
  PaymentsControllerFindAllParams,
  PaymentsControllerFindByPatientIdParams,
  PaymentsControllerGetRevenueByPeriodParams,
  PaymentsControllerGetStatisticsParams,
  PaymentsControllerGetTotalRevenueParams,
} from '../../types/payments/payments.types';


const cacheManager = new PaymentsCacheManager();

export const usePayments = createQueryHook({
  queryKey: (params?: PaymentsControllerFindAllParams) =>
    cacheManager.getListQueryKey(params),
  queryFn: (params) => paymentsService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    retry: 1,
  },
});

export const usePayment = createQueryHook({
  queryKey: (id?: string) => cacheManager.getDetailQueryKey(id!),
  queryFn: (id) => paymentsService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
    retry: 1,
  },
});

export const usePaymentByInvoice = createQueryHook({
  queryKey: (nomorInvoice?: string) =>
    cacheManager.getByInvoiceQueryKey(nomorInvoice!),
  queryFn: (nomorInvoice) => paymentsService.findByInvoice(nomorInvoice!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
    retry: 1,
  },
});

export const usePaymentByMedicalRecord = createQueryHook({
  queryKey: (medicalRecordId?: string) =>
    cacheManager.getByMedicalRecordIdQueryKey(medicalRecordId!),
  queryFn: (medicalRecordId) => paymentsService.findByMedicalRecordId(medicalRecordId!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
    retry: 1,
  },
});

export const usePaymentsByPatient = createQueryHook({
  queryKey: (params?: { patientId?: string } & PaymentsControllerFindByPatientIdParams) => {
    if (!params?.patientId) return [];
    return cacheManager.getByPatientIdQueryKey(params.patientId);
  },
  queryFn: (params?: { patientId?: string } & PaymentsControllerFindByPatientIdParams) => {
    if (!params?.patientId) throw new Error('patientId wajib ada');
    return paymentsService.findByPatientId(params.patientId);
  },
  options: {
    enabled: false,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    retry: 1,
  },
});

export const usePaymentStatistics = createQueryHook({
  queryKey: (_params?: PaymentsControllerGetStatisticsParams) =>
    cacheManager.getStatisticsQueryKey(),
  queryFn: () => paymentsService.getStatistics(),
  options: {
    staleTime: 5 * 60 * 1000,
  },
});

export const useTotalRevenue = createQueryHook({
  queryKey: (params?: PaymentsControllerGetTotalRevenueParams) =>
    cacheManager.getTotalRevenueQueryKey(params),
  queryFn: (params) => paymentsService.getTotalRevenue(params),
  options: {
    staleTime: 5 * 60 * 1000,
  },
});

export const useRevenueByPeriod = createQueryHook({
  queryKey: (params?: PaymentsControllerGetRevenueByPeriodParams) =>
    cacheManager.getRevenueByPeriodQueryKey(params),
  queryFn: (params) => paymentsService.getRevenueByPeriod(params!),
  options: {
    enabled: false,
    staleTime: 5 * 60 * 1000,
  },
});

export const useCreatePayment = createMutationHook({
  mutationFn: (data: CreatePaymentDto) => paymentsService.create(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('Pembayaran berhasil dibuat');
    cacheManager.invalidateAll(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal membuat pembayaran');
  },
});

export const useUpdatePayment = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: UpdatePaymentDto }) =>
    paymentsService.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('Pembayaran berhasil diperbarui');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal memperbarui pembayaran');
  },
});

export const useProcessPayment = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: ProcessPaymentDto }) =>
    paymentsService.processPayment(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('Pembayaran berhasil diproses');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal memproses pembayaran');
  },
});

export const useCancelPayment = createMutationHook({
  mutationFn: (id: string) => paymentsService.cancel(id),
  onSuccess: (_, id, queryClient) => {
    toast.success('Pembayaran berhasil dibatalkan');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal membatalkan pembayaran');
  },
});

export const useRemovePayment = createMutationHook({
  mutationFn: (id: string) => paymentsService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Pembayaran berhasil dihapus');
    cacheManager.invalidateAll(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal menghapus pembayaran');
  },
});

export function usePaymentValidation() {
  return {
    validateCreate: (data: CreatePaymentFormData): PaymentValidation =>
      paymentsValidators.validateCreate(data),
    validateUpdate: (data: Partial<CreatePaymentFormData>): PaymentValidation =>
      paymentsValidators.validateUpdate(data),
    calculateKembalian: (totalBiaya: number, jumlahBayar: number): number =>
      paymentsHelpers.calculateKembalian(totalBiaya, jumlahBayar),
  };
}

export function usePaymentMutations() {
  const create = useCreatePayment();
  const update = useUpdatePayment();
  const process = useProcessPayment();
  const cancel = useCancelPayment();
  const remove = useRemovePayment();

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    process: process.mutate,
    processAsync: process.mutateAsync,
    cancel: cancel.mutate,
    cancelAsync: cancel.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,

    isCreating: create.isPending,
    isUpdating: update.isPending,
    isProcessing: process.isPending,
    isCancelling: cancel.isPending,
    isRemoving: remove.isPending,

    isMutating:
      create.isPending ||
      update.isPending ||
      process.isPending ||
      cancel.isPending ||
      remove.isPending,

    createError: create.error,
    updateError: update.error,
    processError: process.error,
    cancelError: cancel.error,
    removeError: remove.error,

    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetProcess: process.reset,
    resetCancel: cancel.reset,
    resetRemove: remove.reset,
  };
}

export function usePrefetchPayments() {
  const queryClient = useQueryClient();

  return {
    prefetchList: (params?: PaymentsControllerFindAllParams) =>
      cacheManager.prefetchList(queryClient, params),
    prefetchDetail: (id: string) =>
      cacheManager.prefetchDetail(queryClient, id),
    prefetchStatistics: () =>
      cacheManager.prefetchStatistics(queryClient),
  };
}

export function useInvalidatePayments() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateList: (params?: PaymentsControllerFindAllParams) =>
      cacheManager.invalidateList(queryClient, params),
    invalidateDetail: (id: string) =>
      cacheManager.invalidateDetail(queryClient, id),
    invalidateByInvoice: (nomorInvoice: string) =>
      cacheManager.invalidateByInvoice(queryClient, nomorInvoice),
    invalidateByMedicalRecord: (medicalRecordId: string) =>
      cacheManager.invalidateByMedicalRecordId(queryClient, medicalRecordId),
    invalidateByPatient: (patientId: string) =>
      cacheManager.invalidateByPatientId(queryClient, patientId),
    invalidateStatistics: () =>
      cacheManager.invalidateStatistics(queryClient),
  };
}

// Export helpers & types
export { paymentsHelpers };
export type {
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  PaymentValidation,
};