import { useQueryClient } from '@tanstack/react-query';
import { PaymentsCacheManager } from '../../service/api/payments/cache/cache.manager';
import type { PaymentsControllerFindAllParams } from '../../types/payments/payments.types';

const cacheManager = new PaymentsCacheManager();

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