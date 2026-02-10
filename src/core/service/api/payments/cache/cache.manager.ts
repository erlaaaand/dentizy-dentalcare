import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';
import {
  getPaymentsControllerFindAllQueryKey,
  getPaymentsControllerFindByNomorInvoiceQueryKey,
  getPaymentsControllerFindByMedicalRecordIdQueryKey,
  getPaymentsControllerFindByPatientIdQueryKey,
  getPaymentsControllerGetStatisticsQueryKey,
  getPaymentsControllerGetTotalRevenueQueryKey,
  getPaymentsControllerGetRevenueByPeriodQueryKey,
  getPaymentsControllerFindOneQueryKey
} from '../../../../api/generated/payments/payments';

import { paymentsService } from '../payments.api';

/**
 * Payments Cache Manager
 * Manages React Query cache for payments
 * Extends BaseService for common cache operations
 */
export class PaymentsCacheManager extends BaseService {
  /**
   * Get list query key
   */
  getListQueryKey(params?: undefined) {
    return getPaymentsControllerFindAllQueryKey(params);
  }

  /**
   * Get detail query key
   */
  getDetailQueryKey(id: string) {
    return getPaymentsControllerFindOneQueryKey(id);
  }

  /**
   * Get by invoice query key
   */
  getByInvoiceQueryKey(nomorInvoice: string) {
    return getPaymentsControllerFindByNomorInvoiceQueryKey(nomorInvoice);
  }

  /**
   * Get by medical record query key
   */
  getByMedicalRecordIdQueryKey(medicalRecordId: string) {
    return getPaymentsControllerFindByMedicalRecordIdQueryKey(medicalRecordId);
  }

  /**
   * Get by patient query key
   */
  getByPatientIdQueryKey(patientId: string) {
    return getPaymentsControllerFindByPatientIdQueryKey(patientId);
  }

  /**
   * Get statistics query key
   */
  getStatisticsQueryKey() {
    return getPaymentsControllerGetStatisticsQueryKey();
  }

  /**
   * Get total revenue query key
   */
  getTotalRevenueQueryKey(params?: undefined) {
    return getPaymentsControllerGetTotalRevenueQueryKey(params);
  }

  /**
   * Get revenue by period query key
   */
  getRevenueByPeriodQueryKey(params?: undefined) {
    return getPaymentsControllerGetRevenueByPeriodQueryKey(params);
  }

  /**
   * Invalidate list
   */
  invalidateList(queryClient: QueryClient, params?: undefined): Promise<void> {
    return this.invalidateQueries(queryClient, this.getListQueryKey(params));
  }

  /**
   * Invalidate detail
   */
  invalidateDetail(queryClient: QueryClient, id: string): Promise<void> {
    return this.invalidateQueries(queryClient, this.getDetailQueryKey(id));
  }

  /**
   * Invalidate by invoice
   */
  invalidateByInvoice(queryClient: QueryClient, nomorInvoice: string): Promise<void> {
    return this.invalidateQueries(queryClient, this.getByInvoiceQueryKey(nomorInvoice));
  }

  /**
   * Invalidate by medical record
   */
  invalidateByMedicalRecordId(queryClient: QueryClient, medicalRecordId: string): Promise<void> {
    return this.invalidateQueries(queryClient, this.getByMedicalRecordIdQueryKey(medicalRecordId));
  }

  /**
   * Invalidate by patient
   */
  invalidateByPatientId(queryClient: QueryClient, patientId: string): Promise<void> {
    return this.invalidateQueries(queryClient, this.getByPatientIdQueryKey(patientId));
  }

  /**
   * Invalidate statistics
   */
  invalidateStatistics(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, this.getStatisticsQueryKey());
  }

  /**
   * Invalidate total revenue
   */
  invalidateTotalRevenue(queryClient: QueryClient, params?: undefined): Promise<void> {
    return this.invalidateQueries(queryClient, this.getTotalRevenueQueryKey(params));
  }

  /**
   * Invalidate revenue by period
   */
  invalidateRevenueByPeriod(queryClient: QueryClient, params?: undefined): Promise<void> {
    return this.invalidateQueries(queryClient, this.getRevenueByPeriodQueryKey(params));
  }

  /**
   * Invalidate all payment queries
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          queryKey.length > 0 &&
          typeof queryKey[0] === 'string' &&
          queryKey[0].startsWith('/payments')
        );
      }
    });
  }

  /**
   * Prefetch list
   */
  async prefetchList(queryClient: QueryClient, params?: undefined): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getListQueryKey(params),
      () => paymentsService.findAll(params)
    );
  }

  /**
   * Prefetch detail
   */
  async prefetchDetail(queryClient: QueryClient, id: string): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => paymentsService.findOne(id)
    );
  }

  /**
   * Prefetch statistics
   */
  async prefetchStatistics(queryClient: QueryClient): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getStatisticsQueryKey(),
      () => paymentsService.getStatistics()
    );
  }
}

export const paymentsCacheManager = new PaymentsCacheManager();