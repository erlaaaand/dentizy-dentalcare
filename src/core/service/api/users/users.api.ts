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
} from '../../../api/generated/users/users';

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

/**
 * Users Service
 * Handles all user-related API calls
 * Extends BaseService for common query operations
 */
export class UsersService extends BaseService {
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
}

export const usersService = new UsersService();