// frontend/src/core/validators/user.schema.ts
import { VALIDATION_RULES } from '@/core/constants/validation.constants';

interface UserFormData {
  nama_lengkap?: string;
  username?: string;
  password?: string;
  roles?: number[];
}

export function validateUserForm(
  data: Partial<UserFormData>,
  isEdit: boolean = false
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.nama_lengkap?.trim()) {
    errors.nama_lengkap = 'Nama lengkap harus diisi';
  } else if (data.nama_lengkap.trim().length < 3) {
    errors.nama_lengkap = 'Nama lengkap minimal 3 karakter';
  }

  if (!data.username?.trim()) {
    errors.username = 'Username harus diisi';
  } else if (data.username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    errors.username = `Username minimal ${VALIDATION_RULES.USERNAME.MIN_LENGTH} karakter`;
  } else if (!VALIDATION_RULES.USERNAME.PATTERN.test(data.username)) {
    errors.username = 'Username hanya boleh berisi huruf, angka, dan underscore';
  }

  if (!isEdit) {
    if (!data.password) {
      errors.password = 'Password harus diisi';
    } else if (data.password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      errors.password = `Password minimal ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} karakter`;
    }
  }

  if (!data.roles || data.roles.length === 0) {
    errors.roles = 'Minimal satu role harus dipilih';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function sanitizeUserFormData(
  data: Partial<UserFormData>,
  isEdit: boolean = false
): Partial<UserFormData> {
  const sanitized: Partial<UserFormData> = {
    nama_lengkap: data.nama_lengkap?.trim() || '',
    username: data.username?.trim().toLowerCase() || '',
    roles: data.roles || [],
  };

  if (!isEdit && data.password) {
    sanitized.password = data.password;
  }

  return sanitized;
}