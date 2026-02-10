import { BaseService } from '../../base/base.service';
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
} from '../../../api/generated/payments/payments';

import type {
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  PaymentResponseDto,
  PaymentsControllerGetRevenueByPeriodParams,
  PaymentsControllerFindAllParams,
} from '../../../types/payments/payments.types';

/**
 * Payments Service
 * Handles all payment-related API calls
 * Extends BaseService for common query operations
 */
export class PaymentsService extends BaseService {
  /**
   * Process payment (cashier)
   */
  async processPayment(
    id: string,
    data: ProcessPaymentDto
  ): Promise<PaymentResponseDto> {
    const response = await paymentsControllerProcess(id, data);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to process payment');
  }

  /**
   * Create new payment
   */
  async create(data: CreatePaymentDto): Promise<PaymentResponseDto> {
    const response = await paymentsControllerCreate(data);
    if (response.status === 201) {
      return response.data;
    }
    throw new Error('Failed to create payment');
  }

  /**
   * Find all payments
   */
  async findAll(params?: PaymentsControllerFindAllParams): Promise<unknown> {
    const response = await paymentsControllerFindAll(params);
    return response.data;
  }

  /**
   * Find one payment by ID
   */
  async findOne(id: string): Promise<PaymentResponseDto | null> {
    const response = await paymentsControllerFindOne(id);
    return response.data ?? null;
  }

  /**
   * Find payment by invoice number
   */
  async findByInvoice(nomorInvoice: string): Promise<PaymentResponseDto> {
    const response = await paymentsControllerFindByNomorInvoice(nomorInvoice);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Payment not found');
  }

  /**
   * Find payments by medical record ID
   */
  async findByMedicalRecordId(medicalRecordId: string): Promise<unknown> {
    const response = await paymentsControllerFindByMedicalRecordId(medicalRecordId);
    return response.data;
  }

  /**
   * Find payments by patient ID
   */
  async findByPatientId(patientId: string): Promise<unknown> {
    const response = await paymentsControllerFindByPatientId(patientId);
    return response.data;
  }

  /**
   * Get payment statistics
   */
  async getStatistics(): Promise<unknown> {
    const response = await paymentsControllerGetStatistics();
    return response.data;
  }

  /**
   * Get total revenue
   */
  async getTotalRevenue(params?: undefined): Promise<unknown> {
    const response = await paymentsControllerGetTotalRevenue(params);
    return response.data;
  }

  /**
   * Get revenue by period
   */
  async getRevenueByPeriod(params: PaymentsControllerGetRevenueByPeriodParams): Promise<unknown> {
    const response = await paymentsControllerGetRevenueByPeriod(params);
    return response.data;
  }

  /**
   * Update payment
   */
  async update(
    id: string,
    data: UpdatePaymentDto
  ): Promise<PaymentResponseDto> {
    const response = await paymentsControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to update payment');
  }

  /**
   * Cancel payment
   */
  async cancel(id: string): Promise<PaymentResponseDto> {
    const response = await paymentsControllerCancel(id);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to cancel payment');
  }

  /**
   * Delete payment
   */
  async remove(id: string): Promise<void> {
    const response = await paymentsControllerRemove(id);
    if (response.status !== 200) {
      throw new Error('Failed to delete payment');
    }
  }
}

export const paymentsService = new PaymentsService();