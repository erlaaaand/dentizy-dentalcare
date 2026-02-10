import { paymentsValidators } from '../../service/api/payments/validators/payments.validators';
import { paymentsHelpers } from '../../service/api/payments/helpers/payment.helper';
import type {
  PaymentValidation,
  CreatePaymentFormData,
} from '../../types/payments/payments.types';

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