import { BaseService } from '../../base/base.service';
import {
  usersControllerFindAll,
  usersControllerCreate,
  usersControllerUpdate,
  usersControllerRemove,
  usersControllerFindOne,
  usersControllerChangePassword,
  usersControllerResetPassword,
  usersControllerGenerateTempPassword,
  usersControllerGetStatistics,
  usersControllerGetRecentUsers,
  usersControllerCheckUsername,
  usersControllerCheckActivationStatus,
  usersControllerRequestActivation,
  usersControllerResendActivation,
  usersControllerVerifyActivationToken,
  usersControllerActivateAccount,
  getUsersControllerFindAllQueryKey,
  getUsersControllerFindOneQueryKey,
  getUsersControllerGetStatisticsQueryKey,
  getUsersControllerGetRecentUsersQueryKey,
  getUsersControllerCheckUsernameQueryKey
} from '../../../api/generated/users/users';

import type { QueryClient } from '@tanstack/react-query';
import type {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
  UserQueryParams,
  RecentUsersParams,
  CheckActivationStatusDto,
  RequestActivationDto,
  VerifyActivationTokenDto,
  ActivateAccountDto,
  User,
  PasswordChangeResponseDto,
  ActivateAccountResponseDto,
} from '../../../types/users/user.types';

// Re-export hooks
export {
  useUsersControllerFindAll,
  useUsersControllerCreate,
  useUsersControllerUpdate,
  useUsersControllerRemove,
  useUsersControllerFindOne,
  useUsersControllerChangePassword,
  useUsersControllerResetPassword,
  useUsersControllerGenerateTempPassword,
  useUsersControllerGetStatistics,
  useUsersControllerGetRecentUsers,
  useUsersControllerCheckUsername,
  useUsersControllerCheckActivationStatus,
  useUsersControllerRequestActivation,
  useUsersControllerResendActivation,
  useUsersControllerVerifyActivationToken,
  useUsersControllerActivateAccount
} from '../../../api/generated/users/users';

// Re-export query keys
export {
  getUsersControllerFindAllQueryKey,
  getUsersControllerFindOneQueryKey,
  getUsersControllerGetStatisticsQueryKey,
  getUsersControllerGetRecentUsersQueryKey,
  getUsersControllerCheckUsernameQueryKey
};

class UsersService extends BaseService {
  // ==================== QUERIES ====================
  
  async findAll(params?: UserQueryParams): Promise<unknown> {
    const response = await usersControllerFindAll(params);
    return response.data;
  }

  async findOne(id: string): Promise<User> {
    const response = await usersControllerFindOne(id);
    return response.data as User;
  }

  async getStatistics(): Promise<unknown> {
    const response = await usersControllerGetStatistics();
    return response.data;
  }

  async getRecentUsers(params?: RecentUsersParams): Promise<unknown> {
    const response = await usersControllerGetRecentUsers(params);
    return response.data;
  }

  async checkUsername(username: string): Promise<{ available: boolean }> {
    const response = await usersControllerCheckUsername(username);
    return response.data as { available: boolean };
  }

  // ==================== MUTATIONS ====================
  
  async create(data: CreateUserDto): Promise<User> {
    const response = await usersControllerCreate(data);
    if (response.status === 201) {
      return response.data as User;
    }
    throw new Error('Failed to create user');
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await usersControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data as User;
    }
    throw new Error('Failed to update user');
  }

  async remove(id: string): Promise<void> {
    const response = await usersControllerRemove(id);
    if (response.status !== 200) {
      throw new Error('Failed to remove user');
    }
  }

  async changePassword(data: ChangePasswordDto): Promise<unknown> {
    const response = await usersControllerChangePassword(data);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to change password');
  }

  async resetPassword(id: string, data: ResetPasswordDto): Promise<PasswordChangeResponseDto> {
    const response = await usersControllerResetPassword(id, data);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to reset password');
  }

  async generateTempPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await usersControllerGenerateTempPassword(id);
    if (response.status === 200) {
      return response.data as { temporaryPassword: string };
    }
    throw new Error('Failed to generate temporary password');
  }

  // ==================== ACTIVATION ====================
  
  async checkActivationStatus(data: CheckActivationStatusDto): Promise<unknown> {
    const response = await usersControllerCheckActivationStatus(data);
    return response.data;
  }

  async requestActivation(data: RequestActivationDto): Promise<unknown> {
    const response = await usersControllerRequestActivation(data);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to request activation');
  }

  async resendActivation(data: RequestActivationDto): Promise<unknown> {
    const response = await usersControllerResendActivation(data);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to resend activation');
  }

  async verifyActivationToken(data: VerifyActivationTokenDto): Promise<unknown> {
    const response = await usersControllerVerifyActivationToken(data);
    return response.data;
  }

  async activateAccount(data: ActivateAccountDto): Promise<ActivateAccountResponseDto> {
    const response = await usersControllerActivateAccount(data);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to activate account');
  }

  // ==================== QUERY KEYS ====================
  
  getListQueryKey(params?: UserQueryParams) {
    return getUsersControllerFindAllQueryKey(params);
  }

  getDetailQueryKey(id: string) {
    return getUsersControllerFindOneQueryKey(id);
  }

  getStatisticsQueryKey() {
    return getUsersControllerGetStatisticsQueryKey();
  }

  getRecentUsersQueryKey(params?: RecentUsersParams) {
    return getUsersControllerGetRecentUsersQueryKey(params);
  }

  getCheckUsernameQueryKey(username: string) {
    return getUsersControllerCheckUsernameQueryKey(username);
  }

  // ==================== CACHE UTILITIES ====================
  
  invalidateList(queryClient: QueryClient, params?: UserQueryParams) {
    return this.invalidateQueries(queryClient, this.getListQueryKey(params));
  }

  invalidateDetail(queryClient: QueryClient, id: string) {
    return this.invalidateQueries(queryClient, this.getDetailQueryKey(id));
  }

  invalidateStatistics(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, this.getStatisticsQueryKey());
  }

  invalidateRecentUsers(queryClient: QueryClient, params?: RecentUsersParams) {
    return this.invalidateQueries(queryClient, this.getRecentUsersQueryKey(params));
  }

  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/users'] as const);
  }

  async prefetchList(queryClient: QueryClient, params?: UserQueryParams) {
    return this.prefetchQuery(
      queryClient,
      this.getListQueryKey(params),
      () => this.findAll(params)
    );
  }

  async prefetchDetail(queryClient: QueryClient, id: string) {
    return this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => this.findOne(id)
    );
  }

  optimisticUpdate(
    queryClient: QueryClient,
    id: string,
    updater: (old: User) => User
  ) {
    const queryKey = this.getDetailQueryKey(id);
    const previousData = this.getQueryData<User>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const usersService = new UsersService();

// Helper functions
export const usersHelpers = {
  /**
   * Format username for display
   */
  formatUsername(username: string): string {
    return username.toLowerCase().trim();
  },

  /**
   * Get role label
   */
  getRoleLabel(user: User): string {
    if (!user.roles || user.roles.length === 0) return 'No Role';
    return user.roles.map(role => role.name).join(', ');
  },

  /**
   * Get primary role
   */
  getPrimaryRole(user: User): string | null {
    if (!user.roles || user.roles.length === 0) return null;
    return user.roles[0].name;
  },

  /**
   * Check if user has specific role
   */
  hasRole(user: User, roleName: string): boolean {
    if (!user.roles) return false;
    return user.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
  },

  /**
   * Check if user is active
   */
  isActive(user: User): boolean {
    return !user.is_active;
  },

  /**
   * Check if user can be deleted
   */
  canDelete(user: User): boolean {
    return !user.deleted_at;
  },

  /**
   * Get user display name
   */
  getDisplayName(user: User): string {
    return user.nama_lengkap || user.username;
  },

  /**
   * Get user initials
   */
  getInitials(user: User): string {
    const name = user.nama_lengkap || user.username;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 8) {
      errors.push('Password minimal 8 karakter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password harus mengandung huruf besar');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password harus mengandung huruf kecil');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password harus mengandung angka');
    } else {
      score += 1;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      score += 0;
    } else {
      score += 1;
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  },

  /**
   * Generate random password
   */
  generateRandomPassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const all = uppercase + lowercase + numbers + special;

    let password = '';
    
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
};