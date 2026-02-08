import type { QueryClient } from '@tanstack/react-query';
import {
  paymentsControllerProcess,
  paymentsControllerCreate,
  paymentsControllerFindAll,
  paymentsControllerFindByNomorInvoice,
  paymentsControllerFindByMedicalRecordId,
  paymentsControllerFindByPatientId,
  paymentsControllerGetStatistics,
  paymentsControllerGetTotalRevenue,
  paymentsControllerGetRevenueByPeriod,
  paymentsControllerFindOne,
  paymentsControllerUpdate,
  paymentsControllerRemove,
  paymentsControllerCancel,
  usePaymentsControllerProcess,
  usePaymentsControllerCreate,
  usePaymentsControllerFindAll,
  usePaymentsControllerFindByNomorInvoice,
  usePaymentsControllerFindByMedicalRecordId,
  usePaymentsControllerFindByPatientId,
  usePaymentsControllerGetStatistics,
  usePaymentsControllerGetTotalRevenue,
  usePaymentsControllerGetRevenueByPeriod,
  usePaymentsControllerFindOne,
  usePaymentsControllerUpdate,
  usePaymentsControllerRemove,
  usePaymentsControllerCancel,
  getPaymentsControllerFindAllQueryKey,
  getPaymentsControllerFindByNomorInvoiceQueryKey,
  getPaymentsControllerFindByMedicalRecordIdQueryKey,
  getPaymentsControllerFindByPatientIdQueryKey,
  getPaymentsControllerGetStatisticsQueryKey,
  getPaymentsControllerGetTotalRevenueQueryKey,
  getPaymentsControllerGetRevenueByPeriodQueryKey,
  getPaymentsControllerFindOneQueryKey
} from '../../../api/generated/payments/payments';

import type {
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  PaymentResponseDto,
} from '../../../api/model';

import type {
  PaymentValidation,
  CreatePaymentFormData,
  PaymentStatus
} from '../../../types/payments/payments.types';

// Re-export hooks
export {
  usePaymentsControllerProcess,
  usePaymentsControllerCreate,
  usePaymentsControllerFindAll,
  usePaymentsControllerFindByNomorInvoice,
  usePaymentsControllerFindByMedicalRecordId,
  usePaymentsControllerFindByPatientId,
  usePaymentsControllerGetStatistics,
  usePaymentsControllerGetTotalRevenue,
  usePaymentsControllerGetRevenueByPeriod,
  usePaymentsControllerFindOne,
  usePaymentsControllerUpdate,
  usePaymentsControllerRemove,
  usePaymentsControllerCancel
};

// Re-export query keys
export {
  getPaymentsControllerFindAllQueryKey,
  getPaymentsControllerFindByNomorInvoiceQueryKey,
  getPaymentsControllerFindByMedicalRecordIdQueryKey,
  getPaymentsControllerFindByPatientIdQueryKey,
  getPaymentsControllerGetStatisticsQueryKey,
  getPaymentsControllerGetTotalRevenueQueryKey,
  getPaymentsControllerGetRevenueByPeriodQueryKey,
  getPaymentsControllerFindOneQueryKey
};

// Re-export functions
export {
  paymentsControllerProcess,
  paymentsControllerCreate,
  paymentsControllerFindAll,
  paymentsControllerFindByNomorInvoice,
  paymentsControllerFindByMedicalRecordId,
  paymentsControllerFindByPatientId,
  paymentsControllerGetStatistics,
  paymentsControllerGetTotalRevenue,
  paymentsControllerGetRevenueByPeriod,
  paymentsControllerFindOne,
  paymentsControllerUpdate,
  paymentsControllerRemove,
  paymentsControllerCancel
};

// Custom API calls
export const paymentsApi = {
  /**
   * Process payment (cashier)
   */
  async processPayment(
    id: number,
    data: ProcessPaymentDto
  ): Promise<PaymentResponseDto> {
    const response = await paymentsControllerProcess(id, data);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to process payment');
  },

  /**
   * Create new payment
   */
  async create(data: CreatePaymentDto): Promise<PaymentResponseDto> {
    const response = await paymentsControllerCreate(data);
    if (response.status === 201) {
      return response.data;
    }
    throw new Error('Failed to create payment');
  },

  /**
   * Find payment by invoice number
   */
  async findByInvoice(nomorInvoice: string): Promise<PaymentResponseDto> {
    const response = await paymentsControllerFindByNomorInvoice(nomorInvoice);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Payment not found');
  },

  /**
   * Update payment
   */
  async update(
    id: number,
    data: UpdatePaymentDto
  ): Promise<PaymentResponseDto> {
    const response = await paymentsControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to update payment');
  },

  /**
   * Cancel payment
   */
  async cancel(id: number): Promise<PaymentResponseDto> {
    const response = await paymentsControllerCancel(id);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to cancel payment');
  },

  /**
   * Delete payment
   */
  async remove(id: number): Promise<void> {
    const response = await paymentsControllerRemove(id);
    if (response.status !== 200) {
      throw new Error('Failed to delete payment');
    }
  },

  /**
   * Validate payment data
   */
  validatePayment(data: CreatePaymentFormData): PaymentValidation {
    const errors: { field: string; message: string }[] = [];

    if (!data.medicalRecordId) {
      errors.push({
        field: 'medical_record_id',
        message: 'Medical record wajib dipilih'
      });
    }

    if (!data.totalBiaya || data.totalBiaya <= 0) {
      errors.push({
        field: 'total_biaya',
        message: 'Total biaya harus lebih dari 0'
      });
    }

    if (data.jumlahBayar && data.jumlahBayar < 0) {
      errors.push({
        field: 'jumlah_bayar',
        message: 'Jumlah bayar tidak boleh negatif'
      });
    }

    if (!data.metodePembayaran) {
      errors.push({
        field: 'metode_pembayaran',
        message: 'Metode pembayaran wajib dipilih'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get payment status
   */
  getPaymentStatus(payment: PaymentResponseDto): PaymentStatus {
    const isPending = payment.statusPembayaran === 'pending';
    const isCompleted = payment.statusPembayaran === 'lunas';
    const isPartial = payment.statusPembayaran === 'sebagian';
    const isCancelled = payment.statusPembayaran === 'dibatalkan';

    return {
      isPending,
      isCompleted,
      isPartial,
      isCancelled,
      canEdit: !isCompleted && !isCancelled,
      canDelete: isPending,
      canProcess: isPending || isPartial,
      canRefund: isCompleted
    };
  },

  /**
   * Calculate change
   */
  calculateKembalian(totalBiaya: number, jumlahBayar: number): number {
    return Math.max(0, jumlahBayar - totalBiaya);
  },

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
};

// Helper functions
export const paymentsHelpers = {
  /**
   * Format currency to IDR
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  },

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      lunas: 'Lunas',
      sebagian: 'Sebagian',
      dibatalkan: 'Dibatalkan'
    };
    return labels[status] || status;
  },

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'yellow',
      lunas: 'green',
      sebagian: 'blue',
      dibatalkan: 'red'
    };
    return colors[status] || 'gray';
  },

  /**
   * Get method label
   */
  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      tunai: 'Tunai',
      transfer: 'Transfer Bank',
      kartu_kredit: 'Kartu Kredit',
      kartu_debit: 'Kartu Debit',
      qris: 'QRIS'
    };
    return labels[method] || method;
  },

  /**
   * Format invoice number
   */
  formatInvoiceNumber(invoice: string): string {
    return invoice.toUpperCase();
  },

  /**
   * Check if payment is overdue
   */
  isOverdue(createdAt: string, daysThreshold: number = 30): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > daysThreshold;
  }
};

export type {
  PaymentResponseDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  PaymentValidation,
  PaymentStatus
};