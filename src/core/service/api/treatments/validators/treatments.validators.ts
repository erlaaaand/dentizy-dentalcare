import type { CreateTreatmentDto, UpdateTreatmentDto } from '../../../../types/treatments/treatment.types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface TreatmentValidation {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Treatments Validators
 * Validates treatment data before submission
 */
export class TreatmentsValidators {

  validateNamaTreatment(nama: string): ValidationError | null {
    if (!nama || nama.trim() === '') {
      return { field: 'namaTreatment', message: 'Nama treatment wajib diisi' };
    }
    if (nama.length < 3) {
      return { field: 'namaTreatment', message: 'Nama minimal 3 karakter' };
    }
    return null;
  }

  validateHarga(harga: number): ValidationError | null {
    if (harga === undefined || harga === null) {
      return { field: 'harga', message: 'Harga wajib diisi' };
    }
    if (harga < 0) {
      return { field: 'harga', message: 'Harga tidak boleh negatif' };
    }
    return null;
  }

  validateCreate(data: CreateTreatmentDto): TreatmentValidation {
    const errors: ValidationError[] = [];

    const namaError = this.validateNamaTreatment(data.namaPerawatan);
    if (namaError) errors.push(namaError);

    const hargaError = this.validateHarga(data.harga);
    if (hargaError) errors.push(hargaError);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateUpdate(data: UpdateTreatmentDto): TreatmentValidation {
    const errors: ValidationError[] = [];

    if (data.namaPerawatan !== undefined) {
      const namaError = this.validateNamaTreatment(data.namaPerawatan);
      if (namaError) errors.push(namaError);
    }

    if (data.harga !== undefined) {
      const hargaError = this.validateHarga(data.harga);
      if (hargaError) errors.push(hargaError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const treatmentsValidators = new TreatmentsValidators();