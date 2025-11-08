import { VALIDATION } from '@/lib/constants';

export interface LoginFormData {
  username: string;
  password: string;
}

export interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Validate login form
 */
export function validateLoginForm(data: LoginFormData): { 
  isValid: boolean; 
  errors: Partial<Record<keyof LoginFormData, string>> 
} {
  const errors: Partial<Record<keyof LoginFormData, string>> = {};
  
  // Username validation
  if (!data.username?.trim()) {
    errors.username = 'Username harus diisi';
  } else if (data.username.length < VALIDATION.USERNAME_MIN_LENGTH) {
    errors.username = `Username minimal ${VALIDATION.USERNAME_MIN_LENGTH} karakter`;
  }
  
  // Password validation
  if (!data.password) {
    errors.password = 'Password harus diisi';
  } else if (data.password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.password = `Password minimal ${VALIDATION.PASSWORD_MIN_LENGTH} karakter`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate change password form
 */
export function validateChangePasswordForm(data: ChangePasswordFormData): { 
  isValid: boolean; 
  errors: Partial<Record<keyof ChangePasswordFormData, string>> 
} {
  const errors: Partial<Record<keyof ChangePasswordFormData, string>> = {};
  
  // Old password validation
  if (!data.oldPassword) {
    errors.oldPassword = 'Password lama harus diisi';
  }
  
  // New password validation
  if (!data.newPassword) {
    errors.newPassword = 'Password baru harus diisi';
  } else if (data.newPassword.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.newPassword = `Password minimal ${VALIDATION.PASSWORD_MIN_LENGTH} karakter`;
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