// frontend/src/core/validators/userSchema.ts
import { VALIDATION_RULES } from '@/core/constants/validation.constants';
import { ID } from '@/core/types/api';

export interface UserFormData {
  nama_lengkap: string;
  username: string;
  password?: string;
  confirmPassword?: string;
  roles: ID[];
}

/**
 * Validate user form
 */
export function validateUserForm(
  data: UserFormData,
  isEdit: boolean = false
): {
  isValid: boolean;
  errors: Partial<Record<keyof UserFormData, string>>;
} {
  const errors: Partial<Record<keyof UserFormData, string>> = {};

  // Name validation
  if (!data.nama_lengkap?.trim()) {
    errors.nama_lengkap = 'Nama lengkap harus diisi';
  } else if (data.nama_lengkap.trim().length < 3) {
    errors.nama_lengkap = 'Nama lengkap minimal 3 karakter';
  }

  // Username validation
  if (!data.username?.trim()) {
    errors.username = 'Username harus diisi';
  } else if (data.username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    errors.username = `Username minimal ${VALIDATION_RULES.USERNAME.MIN_LENGTH} karakter`;
  } else if (!VALIDATION_RULES.USERNAME.PATTERN.test(data.username)) {
    errors.username = 'Username hanya boleh berisi huruf, angka, dan underscore';
  }

  // Password validation (required for new user, optional for edit)
  if (!isEdit) {
    if (!data.password) {
      errors.password = 'Password harus diisi';
    } else if (data.password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      errors.password = `Password minimal ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} karakter`;
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (data.confirmPassword !== data.password) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
  } else {
    // If editing and password is provided, validate it
    if (data.password) {
      if (data.password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
        errors.password = `Password minimal ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} karakter`;
      }

      if (data.confirmPassword !== data.password) {
        errors.confirmPassword = 'Konfirmasi password tidak cocok';
      }
    }
  }

  // Roles validation
  if (!data.roles || data.roles.length === 0) {
    errors.roles = 'Minimal satu role harus dipilih';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize user form data
 */
export function sanitizeUserFormData(
  data: UserFormData,
  isEdit: boolean = false
): Partial<UserFormData> {
  const sanitized: Partial<UserFormData> = {
    nama_lengkap: data.nama_lengkap?.trim() || '',
    username: data.username?.trim().toLowerCase() || '',
    roles: data.roles || [],
  };

  // Only include password if it's provided and not empty
  if (data.password && data.password.trim()) {
    sanitized.password = data.password;
  }

  return sanitized;
}