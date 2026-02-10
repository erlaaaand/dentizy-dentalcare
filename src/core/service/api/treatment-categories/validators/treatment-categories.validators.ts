import type {
  CreateTreatmentCategoryFormData,
  UpdateTreatmentCategoryFormData,
  TreatmentCategoryValidation
} from '../../../../types/treatment-categories/treatment-categories.types';

/**
 * Treatment Categories Validators
 * Validates treatment category data before submission
 */
export class TreatmentCategoriesValidators {
  /**
   * Validate nama kategori
   */
  validateNamaKategori(namaKategori: string): { field: string; message: string } | null {
    if (!namaKategori || namaKategori.trim() === '') {
      return { field: 'namaKategori', message: 'Nama kategori wajib diisi' };
    }
    
    if (namaKategori.length < 3) {
      return { field: 'namaKategori', message: 'Nama kategori minimal 3 karakter' };
    }
    
    if (namaKategori.length > 100) {
      return { field: 'namaKategori', message: 'Nama kategori maksimal 100 karakter' };
    }

    return null;
  }

  /**
   * Validate deskripsi (optional)
   */
  validateDeskripsi(deskripsi?: string): { field: string; message: string } | null {
    if (deskripsi && deskripsi.length > 500) {
      return { field: 'deskripsi', message: 'Deskripsi maksimal 500 karakter' };
    }

    return null;
  }

  /**
   * Validate category creation data
   */
  validateCreate(
    data: CreateTreatmentCategoryFormData
  ): TreatmentCategoryValidation {
    const errors: { field: string; message: string }[] = [];

    // Validate nama kategori
    const namaKategoriError = this.validateNamaKategori(data.namaKategori);
    if (namaKategoriError) errors.push(namaKategoriError);

    // Validate deskripsi (optional)
    const deskripsiError = this.validateDeskripsi(data.deskripsi);
    if (deskripsiError) errors.push(deskripsiError);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate category update data
   */
  validateUpdate(
    data: UpdateTreatmentCategoryFormData
  ): TreatmentCategoryValidation {
    const errors: { field: string; message: string }[] = [];

    // Only validate fields that are provided
    if (data.namaKategori !== undefined) {
      const namaKategoriError = this.validateNamaKategori(data.namaKategori);
      if (namaKategoriError) errors.push(namaKategoriError);
    }

    if (data.deskripsi !== undefined) {
      const deskripsiError = this.validateDeskripsi(data.deskripsi);
      if (deskripsiError) errors.push(deskripsiError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate category name uniqueness (client-side check)
   */
  isNameUnique(
    name: string,
    existingCategories: Array<{ namaKategori: string; id: number }>,
    currentId?: number
  ): boolean {
    const normalizedName = name.toLowerCase().trim();
    
    return !existingCategories.some(
      (cat) =>
        cat.namaKategori.toLowerCase().trim() === normalizedName &&
        cat.id !== currentId
    );
  }
}

export const treatmentCategoriesValidators = new TreatmentCategoriesValidators();