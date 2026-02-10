import { keepPreviousData } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { paymentsService } from '../../service/api/payments/payments.api';
import { PaymentsCacheManager } from '../../service/api/payments/cache/cache.manager';
import type {
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