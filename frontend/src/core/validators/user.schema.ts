// frontend/src/core/validators/userSchema.ts
import { VALIDATION_RULES } from '@/core/constants/validation.constants';
import { CreateUserDto, UpdateUserDto } from '@/core/api/model';

/**
 * Validate user form
 */
export function validateUserForm(
  data: Partial<CreateUserDto | UpdateUserDto>,
  isEdit: boolean = false
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
    const createData = data as Partial<CreateUserDto>;
    if (!createData.password) {
      errors.password = 'Password harus diisi';
    } else if (createData.password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      errors.password = `Password minimal ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} karakter`;
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
  data: Partial<CreateUserDto | UpdateUserDto>,
  isEdit: boolean = false
): Partial<CreateUserDto | UpdateUserDto> {
  const sanitized: Partial<CreateUserDto | UpdateUserDto> = {
    nama_lengkap: data.nama_lengkap?.trim() || '',
    username: data.username?.trim().toLowerCase() || '',
    roles: data.roles || [],
  };

  // Only include password for CreateUserDto
  if (!isEdit && 'password' in data && data.password) {
    (sanitized as CreateUserDto).password = data.password;
  }

  return sanitized;
}