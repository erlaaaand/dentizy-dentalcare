import { VALIDATION } from '@/core/constants';
import { Gender } from '@/core/types/api';
import { validatePhoneNumber } from '@/core/formatters/phoneFormatter';

export interface PatientFormData {
  nama_lengkap: string;
  nik?: string;
  email?: string;
  no_hp?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: Gender;
  alamat?: string;
}

/**
 * Validate patient form
 */
export function validatePatientForm(data: PatientFormData): { 
  isValid: boolean; 
  errors: Partial<Record<keyof PatientFormData, string>> 
} {
  const errors: Partial<Record<keyof PatientFormData, string>> = {};
  
  // Name validation
  if (!data.nama_lengkap?.trim()) {
    errors.nama_lengkap = 'Nama lengkap harus diisi';
  } else if (data.nama_lengkap.trim().length < 3) {
    errors.nama_lengkap = 'Nama lengkap minimal 3 karakter';
  }
  
  // NIK validation (optional but must be valid if provided)
  if (data.nik && data.nik.trim()) {
    const nikCleaned = data.nik.replace(/\D/g, '');
    if (nikCleaned.length !== VALIDATION.NIK_LENGTH) {
      errors.nik = `NIK harus ${VALIDATION.NIK_LENGTH} digit`;
    }
  }
  
  // Email validation (optional but must be valid if provided)
  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'Format email tidak valid';
    }
  }
  
  // Phone validation (optional but must be valid if provided)
  if (data.no_hp && data.no_hp.trim()) {
    if (!validatePhoneNumber(data.no_hp)) {
      errors.no_hp = 'Format nomor telepon tidak valid';
    }
  }
  
  // Birth date validation (optional but must be valid if provided)
  if (data.tanggal_lahir) {
    const birthDate = new Date(data.tanggal_lahir);
    const today = new Date();
    
    if (birthDate > today) {
      errors.tanggal_lahir = 'Tanggal lahir tidak boleh di masa depan';
    }
    
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > 150) {
      errors.tanggal_lahir = 'Tanggal lahir tidak valid';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize patient form data
 */
export function sanitizePatientFormData(data: PatientFormData): PatientFormData {
  return {
    nama_lengkap: data.nama_lengkap?.trim() || '',
    nik: data.nik?.trim() || undefined,
    email: data.email?.trim().toLowerCase() || undefined,
    no_hp: data.no_hp?.trim() || undefined,
    tanggal_lahir: data.tanggal_lahir || undefined,
    jenis_kelamin: data.jenis_kelamin || undefined,
    alamat: data.alamat?.trim() || undefined,
  };
}