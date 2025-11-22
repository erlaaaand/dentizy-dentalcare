// frontend/src/core/validators/authSchema.ts
import { VALIDATION_RULES } from '@/core/constants/validation.constants';
import { LoginDto, ChangePasswordDto, UpdateProfileDto } from '@/core/api/model';

/**
 * Validate login form
 */
export function validateLoginForm(data: Partial<LoginDto>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Username validation
  if (!data.username?.trim()) {
    errors.username = 'Username harus diisi';
  } else if (data.username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    errors.username = `Username minimal ${VALIDATION_RULES.USERNAME.MIN_LENGTH} karakter`;
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password harus diisi';
  } else if (data.password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    errors.password = `Password minimal ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} karakter`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate change password form
 */
export function validateChangePasswordForm(data: Partial<ChangePasswordDto>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Old password validation
  if (!data.oldPassword) {
    errors.oldPassword = 'Password lama harus diisi';
  }

  // New password validation
  if (!data.newPassword) {
    errors.newPassword = 'Password baru harus diisi';
  } else if (data.newPassword.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    errors.newPassword = `Password minimal ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} karakter`;
  } else if (data.newPassword === data.oldPassword) {
    errors.newPassword = 'Password baru harus berbeda dengan password lama';
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password harus diisi';
  } else if (data.confirmPassword !== data.newPassword) {
    errors.confirmPassword = 'Konfirmasi password tidak cocok';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate update profile form
 */
export function validateUpdateProfileForm(data: Partial<UpdateProfileDto>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Username validation (optional)
  if (data.username !== undefined) {
    if (!data.username?.trim()) {
      errors.username = 'Username tidak boleh kosong';
    } else if (data.username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
      errors.username = `Username minimal ${VALIDATION_RULES.USERNAME.MIN_LENGTH} karakter`;
    }
  }

  // Name validation (optional)
  if (data.nama_lengkap !== undefined) {
    if (!data.nama_lengkap?.trim()) {
      errors.nama_lengkap = 'Nama lengkap tidak boleh kosong';
    } else if (data.nama_lengkap.trim().length < 3) {
      errors.nama_lengkap = 'Nama lengkap minimal 3 karakter';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}