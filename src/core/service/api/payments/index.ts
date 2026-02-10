/**
 * Payments API Module
 * 
 * This module provides a clean API for managing payments.
 * It's refactored to separate concerns:
 * - Service: Core API calls
 * - Helpers: Utility functions
 * - Validators: Data validation
 * - Cache Manager: React Query cache management
 */

export { paymentsService, PaymentsService } from './payments.api';
export { paymentsHelpers, PaymentsHelpers } from './helpers/payment.helper';
export { paymentsValidators, PaymentsValidators } from './validators/payments.validators';
export { paymentsCacheManager, PaymentsCacheManager } from './cache/cache.manager';

// Re-export generated hooks
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
} from '../../../api/generated/payments/payments';

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
} from '../../../api/generated/payments/payments';

// Re-export types
export type {
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  PaymentResponseDto,
} from '../../../api/model';

export type {
  PaymentValidation,
  CreatePaymentFormData,
  PaymentStatus
} from '../../../types/payments/payments.types';

export type {
  ValidationError,
  PaymentValidation as PaymentValidationResult
} from './validators/payments.validators';