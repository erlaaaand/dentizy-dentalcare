// frontend/src/core/validators/patientSchema.ts
import { VALIDATION_RULES } from '@/core/constants/validation.constants';
import { CreatePatientDto, UpdatePatientDto, CreatePatientDtoJenisKelamin } from '@/core/api/model';
import { validatePhoneNumber } from '@/core/formatters/phoneFormatter';

/**
 * Validate patient form
 */
export function validatePatientForm(
  data: Partial<CreatePatientDto | UpdatePatientDto>
): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.nama_lengkap?.trim()) {
    errors.nama_lengkap = 'Nama lengkap harus diisi';
  } else if (data.nama_lengkap.trim().length < 3) {
    errors.nama_lengkap = 'Nama lengkap minimal 3 karakter';
  }

  // NIK validation (optional but must be valid if provided)
  if (data.nik && data.nik.trim()) {
    const nikCleaned = data.nik.replace(/\D/g, '');
    if (nikCleaned.length !== VALIDATION_RULES.NIK.LENGTH) {
      errors.nik = `NIK harus ${VALIDATION_RULES.NIK.LENGTH} digit`;
    }
  }

  // Email validation (optional but must be valid if provided)
  if (data.email && data.email.trim()) {
    if (!VALIDATION_RULES.EMAIL.PATTERN.test(data.email)) {
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

  // Gender validation (optional)
  if (data.jenis_kelamin) {
    const validGenders: CreatePatientDtoJenisKelamin[] = ['L', 'P'];
    if (!validGenders.includes(data.jenis_kelamin)) {
      errors.jenis_kelamin = 'Jenis kelamin tidak valid';
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
export function sanitizePatientFormData(
  data: Partial<CreatePatientDto | UpdatePatientDto>
): Partial<CreatePatientDto | UpdatePatientDto> {
  return {
    nama_lengkap: data.nama_lengkap?.trim() || '',
    nik: data.nik?.trim() || undefined,
    email: data.email?.trim().toLowerCase() || undefined,
    no_hp: data.no_hp?.trim() || undefined,
    tanggal_lahir: data.tanggal_lahir || undefined,
    jenis_kelamin: data.jenis_kelamin || undefined,
    alamat: data.alamat?.trim() || undefined,
    riwayat_alergi: data.riwayat_alergi?.trim() || undefined,
    riwayat_penyakit: data.riwayat_penyakit?.trim() || undefined,
    catatan_khusus: data.catatan_khusus?.trim() || undefined,
  };
}