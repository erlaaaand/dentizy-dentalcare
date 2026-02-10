import { UpdatePatientDtoJenisKelamin } from '@/src/core/api/model';
import type { CreatePatientDto, UpdatePatientDto } from '../../../../types/patients/patient.types';
import { isValidDate } from '../../../../utils/date/date.utils';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Patients Validators
 * Validates patient data before submission
 */
export class PatientsValidators {
  /**
   * Validate NIK
   */
  validateNIK(nik: string | undefined): ValidationError | null {
    if (!nik || nik.trim() === '') {
      return { field: 'nik', message: 'NIK wajib diisi' };
    }

    const cleaned = nik.replace(/\D/g, '');
    if (!/^\d{16}$/.test(cleaned)) {
      return { field: 'nik', message: 'NIK harus 16 digit angka' };
    }

    return null;
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phone: string | undefined): ValidationError | null {
    if (!phone || phone.trim() === '') {
      return { field: 'no_hp', message: 'Nomor HP wajib diisi' };
    }

    if (!/^(\+62|62|0)[0-9]{9,12}$/.test(phone)) {
      return { field: 'no_hp', message: 'Format nomor HP tidak valid' };
    }

    return null;
  }

  /**
   * Validate email
   */
  validateEmail(email?: string): ValidationError | null {
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { field: 'email', message: 'Format email tidak valid' };
      }
    }

    return null;
  }

  /**
   * Validate patient creation data
   */
  validateCreate(data: CreatePatientDto): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate NIK
    const nikError = this.validateNIK(data.nik);
    if (nikError) errors.push(nikError);

    // Validate name
    if (!data.nama_lengkap || data.nama_lengkap.trim() === '') {
      errors.push({ field: 'nama_lengkap', message: 'Nama lengkap wajib diisi' });
    } else if (data.nama_lengkap.length < 3) {
      errors.push({ field: 'nama_lengkap', message: 'Nama lengkap minimal 3 karakter' });
    }

    // Validate birth date
    if (!data.tanggal_lahir) {
      errors.push({ field: 'tanggal_lahir', message: 'Tanggal lahir wajib diisi' });
    }

    // Validate gender
    if (!data.jenis_kelamin) {
      errors.push({ field: 'jenis_kelamin', message: 'Jenis kelamin wajib dipilih' });
    }

    // Validate phone
    const phoneError = this.validatePhoneNumber(data.no_hp);
    if (phoneError) errors.push(phoneError);

    // Validate email (optional)
    const emailError = this.validateEmail(data.email);
    if (emailError) errors.push(emailError);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateUpdate(data: UpdatePatientDto): ValidationResult {
    const errors: ValidationError[] = [];

    if (data.nomor_rekam_medis !== undefined) {
      if (!data.nomor_rekam_medis || data.nomor_rekam_medis.trim() === '') {
        errors.push({ field: 'nomor_rekam_medis', message: 'Nomor rekam medis tidak boleh kosong' });
      } else if (data.nomor_rekam_medis.length > 50) {
        errors.push({ field: 'nomor_rekam_medis', message: 'Nomor rekam medis maksimal 50 karakter' });
      }
    }

    if (data.nik !== undefined) {
      const nikError = this.validateNIK(data.nik);
      if (nikError) errors.push(nikError);
    }

    if (data.nama_lengkap !== undefined) {
      if (!data.nama_lengkap || data.nama_lengkap.trim() === '') {
        errors.push({ field: 'nama_lengkap', message: 'Nama lengkap wajib diisi' });
      } else if (data.nama_lengkap.length < 3) {
        errors.push({ field: 'nama_lengkap', message: 'Nama lengkap minimal 3 karakter' });
      }
    }

    if (data.tanggal_lahir !== undefined) {
      if (!isValidDate(data.tanggal_lahir)) {
        errors.push({ field: 'tanggal_lahir', message: 'Tanggal lahir tidak valid' });
      }
    }

    if (data.alamat !== undefined) {
      if (!data.alamat || data.alamat.trim() === '') {
        errors.push({ field: 'alamat', message: 'Alamat tidak boleh kosong' });
      }
    }

    if (data.no_hp !== undefined) {
      const phoneError = this.validatePhoneNumber(data.no_hp);
      if (phoneError) errors.push(phoneError);
    }

    if (data.email !== undefined) {
      const emailError = this.validateEmail(data.email);
      if (emailError) errors.push(emailError);
    }

    if (data.jenis_kelamin !== undefined) {
      if (!Object.values(UpdatePatientDtoJenisKelamin).includes(data.jenis_kelamin)) {
        errors.push({ field: 'jenis_kelamin', message: 'Jenis kelamin tidak valid' });
      }
    }

    if (data.is_registered_online !== undefined) {
      if (typeof data.is_registered_online !== 'boolean') {
        errors.push({ field: 'is_registered_online', message: 'Status registrasi online harus berupa boolean' });
      }
    }

    if (data.is_active !== undefined) {
      if (typeof data.is_active !== 'boolean') {
        errors.push({ field: 'is_active', message: 'Status aktif harus berupa boolean' });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const patientsValidators = new PatientsValidators();