import type { CreateUserDto, UpdateUserDto, ChangePasswordDto } from '../../../../types/users/user.types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface UserValidation {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Users Validators
 * Validates user data before submission
 */
export class UsersValidators {
  /**
   * Validate username
   */
  validateUsername(username: string): ValidationError | null {
    if (!username || username.trim() === '') {
      return { field: 'username', message: 'Username wajib diisi' };
    }
    
    if (username.length < 3) {
      return { field: 'username', message: 'Username minimal 3 karakter' };
    }
    
    if (username.length > 50) {
      return { field: 'username', message: 'Username maksimal 50 karakter' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { field: 'username', message: 'Username hanya boleh huruf, angka, dan underscore' };
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
   * Validate password
   */
  validatePassword(password: string): ValidationError | null {
    if (!password || password.trim() === '') {
      return { field: 'password', message: 'Password wajib diisi' };
    }
    
    if (password.length < 8) {
      return { field: 'password', message: 'Password minimal 8 karakter' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { field: 'password', message: 'Password harus mengandung huruf besar' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { field: 'password', message: 'Password harus mengandung huruf kecil' };
    }
    
    if (!/[0-9]/.test(password)) {
      return { field: 'password', message: 'Password harus mengandung angka' };
    }
    
    return null;
  }

  /**
   * Validate nama lengkap
   */
  validateNamaLengkap(nama?: string): ValidationError | null {
    if (nama && nama.length > 200) {
      return { field: 'nama_lengkap', message: 'Nama maksimal 200 karakter' };
    }
    return null;
  }

  /**
   * Validate user creation data
   */
  validateCreate(data: CreateUserDto): UserValidation {
    const errors: ValidationError[] = [];

    // Validate username
    const usernameError = this.validateUsername(data.username);
    if (usernameError) errors.push(usernameError);

    // Validate email
    const emailError = this.validateEmail(data.email);
    if (emailError) errors.push(emailError);

    // Validate password
    const passwordError = this.validatePassword(data.password);
    if (passwordError) errors.push(passwordError);

    // Validate nama lengkap
    const namaError = this.validateNamaLengkap(data.nama_lengkap);
    if (namaError) errors.push(namaError);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user update data
   */
  validateUpdate(data: UpdateUserDto): UserValidation {
    const errors: ValidationError[] = [];

    // Only validate fields that are provided
    if (data.username !== undefined) {
      const usernameError = this.validateUsername(data.username);
      if (usernameError) errors.push(usernameError);
    }

    if (data.email !== undefined) {
      const emailError = this.validateEmail(data.email);
      if (emailError) errors.push(emailError);
    }

    if (data.nama_lengkap !== undefined) {
      const namaError = this.validateNamaLengkap(data.nama_lengkap);
      if (namaError) errors.push(namaError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate change password data
   */
  validateChangePassword(data: ChangePasswordDto): UserValidation {
    const errors: ValidationError[] = [];

    // Validate old password exists
    if (!data.oldPassword) {
      errors.push({ field: 'oldPassword', message: 'Password lama wajib diisi' });
    }

    // Validate new password
    const newPasswordError = this.validatePassword(data.newPassword);
    if (newPasswordError) {
      errors.push({ ...newPasswordError, field: 'newPassword' });
    }

    // Check passwords are different
    if (data.newPassword === data.oldPassword) {
      errors.push({ 
        field: 'newPassword', 
        message: 'Password baru harus berbeda dari password lama' 
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const usersValidators = new UsersValidators();