import type { CreatePaymentFormData } from '../../../../types/payments/payments.types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaymentValidation {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Payments Validators
 * Validates payment data before submission
 */
export class PaymentsValidators {
  /**
   * Validate medical record ID
   */
  validateMedicalRecordId(medicalRecordId?: string): ValidationError | null {
    if (!medicalRecordId) {
      return {
        field: 'medical_record_id',
        message: 'Medical record wajib dipilih'
      };
    }
    return null;
  }

  /**
   * Validate total biaya
   */
  validateTotalBiaya(totalBiaya?: number): ValidationError | null {
    if (!totalBiaya || totalBiaya <= 0) {
      return {
        field: 'total_biaya',
        message: 'Total biaya harus lebih dari 0'
      };
    }
    return null;
  }

  /**
   * Validate jumlah bayar
   */
  validateJumlahBayar(jumlahBayar?: number): ValidationError | null {
    if (jumlahBayar !== undefined && jumlahBayar < 0) {
      return {
        field: 'jumlah_bayar',
        message: 'Jumlah bayar tidak boleh negatif'
      };
    }
    return null;
  }

  /**
   * Validate metode pembayaran
   */
  validateMetodePembayaran(metodePembayaran?: string): ValidationError | null {
    if (!metodePembayaran) {
      return {
        field: 'metode_pembayaran',
        message: 'Metode pembayaran wajib dipilih'
      };
    }

    const validMethods = ['tunai', 'transfer', 'kartu_kredit', 'kartu_debit', 'qris'];
    if (!validMethods.includes(metodePembayaran)) {
      return {
        field: 'metode_pembayaran',
        message: 'Metode pembayaran tidak valid'
      };
    }

    return null;
  }

  /**
   * Validate payment amount is sufficient
   */
  validatePaymentAmount(totalBiaya: number, jumlahBayar: number): ValidationError | null {
    if (jumlahBayar < totalBiaya) {
      return {
        field: 'jumlah_bayar',
        message: `Jumlah bayar minimal ${totalBiaya}`
      };
    }
    return null;
  }

  /**
   * Validate payment creation data
   */
  validateCreate(data: CreatePaymentFormData): PaymentValidation {
    const errors: ValidationError[] = [];

    // Validate medical record
    const medicalRecordError = this.validateMedicalRecordId(data.medicalRecordId);
    if (medicalRecordError) errors.push(medicalRecordError);

    // Validate total biaya
    const totalBiayaError = this.validateTotalBiaya(data.totalBiaya);
    if (totalBiayaError) errors.push(totalBiayaError);

    // Validate jumlah bayar
    const jumlahBayarError = this.validateJumlahBayar(data.jumlahBayar);
    if (jumlahBayarError) errors.push(jumlahBayarError);

    // Validate metode pembayaran
    const metodePembayaranError = this.validateMetodePembayaran(data.metodePembayaran);
    if (metodePembayaranError) errors.push(metodePembayaranError);

    // Validate payment amount is sufficient (if jumlahBayar is provided)
    if (data.totalBiaya && data.jumlahBayar) {
      const amountError = this.validatePaymentAmount(data.totalBiaya, data.jumlahBayar);
      if (amountError) errors.push(amountError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate payment update data
   */
  validateUpdate(data: Partial<CreatePaymentFormData>): PaymentValidation {
    const errors: ValidationError[] = [];

    // Only validate fields that are provided
    if (data.totalBiaya !== undefined) {
      const totalBiayaError = this.validateTotalBiaya(data.totalBiaya);
      if (totalBiayaError) errors.push(totalBiayaError);
    }

    if (data.jumlahBayar !== undefined) {
      const jumlahBayarError = this.validateJumlahBayar(data.jumlahBayar);
      if (jumlahBayarError) errors.push(jumlahBayarError);
    }

    if (data.metodePembayaran !== undefined) {
      const metodePembayaranError = this.validateMetodePembayaran(data.metodePembayaran);
      if (metodePembayaranError) errors.push(metodePembayaranError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const paymentsValidators = new PaymentsValidators();