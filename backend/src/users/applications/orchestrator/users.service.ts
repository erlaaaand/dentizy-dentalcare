// application/orchestrator/users.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { CreateUserService } from '../use-cases/create-user.service';
import { UpdateUserService } from '../use-cases/update-user.service';
import { DeleteUserService } from '../use-cases/delete-user.service';
import { FindUsersService } from '../use-cases/find-users.service';
import { ChangePasswordService } from '../use-cases/change-password.service';
import { ResetPasswordService } from '../use-cases/reset-password.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FindUsersQueryDto } from '../dto/find-users-query.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { PasswordChangeResponseDto } from '../dto/password-change-response.dto';
import { User } from '../../../users/domains/entities/user.entity';

/**
 * UsersService - Orchestrator yang mendelegasikan ke Use Cases
 * Bertindak sebagai facade untuk controller
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly createUserService: CreateUserService,
    private readonly updateUserService: UpdateUserService,
    private readonly deleteUserService: DeleteUserService,
    private readonly findUsersService: FindUsersService,
    private readonly changePasswordService: ChangePasswordService,
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  /**
   * Create new user
   * Input: CreateUserDto (nama_lengkap, username, password, roles)
   * Output: UserResponseDto
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.debug(`Creating user: ${createUserDto.username}`);
    return this.createUserService.execute(createUserDto);
  }

  /**
   * Find all users with pagination and filters
   * Input: FindUsersQueryDto (page, limit, role, search, isActive)
   * Output: { data: UserResponseDto[], meta }
   */
  async findAll(query: FindUsersQueryDto): Promise<{
    data: UserResponseDto[];
    meta: any;
  }> {
    this.logger.debug(`Finding all users with filters`);
    return this.findUsersService.findAll(query);
  }

  /**
   * Find single user by ID
   * Input: userId (number)
   * Output: UserResponseDto
   */
  async findOne(userId: number): Promise<UserResponseDto> {
    this.logger.debug(`Finding user by ID: ${userId}`);
    return this.findUsersService.findOne(userId);
  }

  /**
   * Find user by username (for authentication)
   * Input: username (string)
   * Output: User entity (with password)
   */
  async findByUsernameOrEmail(username: string): Promise<User | null> {
    this.logger.debug(`Finding user by username: ${username}`);
    return this.findUsersService.findByUsernameOrEmailForAuth(username);
  }

  /**
   * Find user by ID (for authentication strategies)
   * Input: userId (number)
   * Output: User entity (with password)
   */
  async findOneForAuth(userId: number): Promise<User | null> {
    this.logger.debug(`Finding user for auth by ID: ${userId}`);
    return this.findUsersService.findOneForAuth(userId);
  }

  /**
   * Update user
   * Input: userId, UpdateUserDto (nama_lengkap?, username?, roles?)
   * Output: UserResponseDto
   */
  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.debug(`Updating user ID: ${userId}`);
    return this.updateUserService.execute(userId, updateUserDto);
  }

  /**
   * Delete user
   * Input: userId (number)
   * Output: { message: string }
   */
  async remove(userId: number): Promise<{ message: string }> {
    this.logger.debug(`Deleting user ID: ${userId}`);
    return this.deleteUserService.execute(userId);
  }

  /**
   * Change password (user context - requires old password)
   * Input: userId, oldPassword, newPassword
   * Output: PasswordChangeResponseDto
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<PasswordChangeResponseDto> {
    this.logger.debug(`Changing password for user ID: ${userId}`);
    return this.changePasswordService.execute(userId, oldPassword, newPassword);
  }

  /**
   * Reset password (admin context - no old password required)
   * Input: userId, newPassword
   * Output: PasswordChangeResponseDto
   */
  async resetPassword(
    userId: number,
    newPassword: string,
  ): Promise<PasswordChangeResponseDto> {
    this.logger.debug(`Resetting password for user ID: ${userId} by admin`);
    return this.resetPasswordService.execute(userId, newPassword, true);
  }

  /**
   * Generate temporary password
   * Input: userId (number)
   * Output: { temporaryPassword: string, message: string }
   */
  async generateTemporaryPassword(userId: number): Promise<{
    temporaryPassword: string;
    message: string;
  }> {
    this.logger.debug(`Generating temporary password for user ID: ${userId}`);
    return this.resetPasswordService.generateTemporaryPassword(userId);
  }

  /**
   * Check username availability
   * Input: username (string)
   * Output: { available: boolean, message: string }
   */
  async checkUsernameAvailability(username: string): Promise<{
    available: boolean;
    message: string;
  }> {
    this.logger.debug(`Checking username availability: ${username}`);
    return this.findUsersService.checkUsernameAvailability(username);
  }

  /**
   * Get user statistics
   * Output: { total, byRole, active, inactive }
   */
  async getUserStatistics(): Promise<{
    total: number;
    byRole: Record<string, number>;
    active: number;
    inactive: number;
  }> {
    this.logger.debug('Getting user statistics');
    return this.findUsersService.getUserStatistics();
  }

  /**
   * Get recently created users
   * Input: limit (number, default 10)
   * Output: UserResponseDto[]
   */
  async getRecentlyCreated(limit: number = 10): Promise<UserResponseDto[]> {
    this.logger.debug(`Getting recently created users (limit: ${limit})`);
    return this.findUsersService.getRecentlyCreated(limit);
  }
}
