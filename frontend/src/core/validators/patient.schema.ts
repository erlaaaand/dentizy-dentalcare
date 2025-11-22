// frontend/src/core/validators/patient.schema.ts
import { VALIDATION_RULES } from '@/core/constants/validation.constants';
import { validatePhoneNumber } from '@/core/formatters/phone.formatter';

type JenisKelamin = 'L' | 'P';

interface PatientFormData {
  nama_lengkap?: string;
  nik?: string;
  email?: string;
  no_hp?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: JenisKelamin;
  alamat?: string;
  riwayat_alergi?: string;
  riwayat_penyakit?: string;
  catatan_khusus?: string;
}

export function validatePatientForm(data: Partial<PatientFormData>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.nama_lengkap?.trim()) {
    errors.nama_lengkap = 'Nama lengkap harus diisi';
  } else if (data.nama_lengkap.trim().length < 3) {
    errors.nama_lengkap = 'Nama lengkap minimal 3 karakter';
  }

  if (data.nik && data.nik.trim()) {
    const nikCleaned = data.nik.replace(/\D/g, '');
    if (nikCleaned.length !== VALIDATION_RULES.NIK.LENGTH) {
      errors.nik = `NIK harus ${VALIDATION_RULES.NIK.LENGTH} digit`;
    }
  }

  if (data.email && data.email.trim()) {
    if (!VALIDATION_RULES.EMAIL.PATTERN.test(data.email)) {
      errors.email = 'Format email tidak valid';
    }
  }

  if (data.no_hp && data.no_hp.trim()) {
    if (!validatePhoneNumber(data.no_hp)) {
      errors.no_hp = 'Format nomor telepon tidak valid';
    }
  }

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

  if (data.jenis_kelamin) {
    const validGenders: JenisKelamin[] = ['L', 'P'];
    if (!validGenders.includes(data.jenis_kelamin)) {
      errors.jenis_kelamin = 'Jenis kelamin tidak valid';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function sanitizePatientFormData(data: Partial<PatientFormData>): Partial<PatientFormData> {
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