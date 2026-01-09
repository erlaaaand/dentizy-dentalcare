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

interface UserListResponse {
  data: UserResponseDto[];
  meta: PaginationMeta;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UsernameAvailability {
  available: boolean;
  message: string;
}

interface UserStatistics {
  total: number;
  byRole: Record<string, number>;
  active: number;
  inactive: number;
}

interface TemporaryPasswordResponse {
  temporaryPassword: string;
  message: string;
}

interface DeleteResponse {
  message: string;
}

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

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.debug(`Creating user: ${createUserDto.username}`);
    return this.createUserService.execute(createUserDto);
  }

  async findAll(query: FindUsersQueryDto): Promise<UserListResponse> {
    this.logger.debug(`Finding all users with filters`);
    return this.findUsersService.findAll(query);
  }

  async findOne(userId: number): Promise<UserResponseDto> {
    this.logger.debug(`Finding user by ID: ${userId}`);
    return this.findUsersService.findOne(userId);
  }

  async findByUsernameOrEmail(username: string): Promise<User | null> {
    this.logger.debug(`Finding user by username: ${username}`);
    return this.findUsersService.findByUsernameOrEmailForAuth(username);
  }

  async findOneForAuth(userId: number): Promise<User | null> {
    this.logger.debug(`Finding user for auth by ID: ${userId}`);
    return this.findUsersService.findOneForAuth(userId);
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.debug(`Updating user ID: ${userId}`);
    return this.updateUserService.execute(userId, updateUserDto);
  }

  async remove(userId: number): Promise<DeleteResponse> {
    this.logger.debug(`Deleting user ID: ${userId}`);
    return this.deleteUserService.execute(userId);
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<PasswordChangeResponseDto> {
    this.logger.debug(`Changing password for user ID: ${userId}`);
    return this.changePasswordService.execute(userId, oldPassword, newPassword);
  }

  async resetPassword(
    userId: number,
    newPassword: string,
  ): Promise<PasswordChangeResponseDto> {
    this.logger.debug(`Resetting password for user ID: ${userId} by admin`);
    return this.resetPasswordService.execute(userId, newPassword, true);
  }

  async generateTemporaryPassword(
    userId: number,
  ): Promise<TemporaryPasswordResponse> {
    this.logger.debug(`Generating temporary password for user ID: ${userId}`);
    return this.resetPasswordService.generateTemporaryPassword(userId);
  }

  async checkUsernameAvailability(
    username: string,
  ): Promise<UsernameAvailability> {
    this.logger.debug(`Checking username availability: ${username}`);
    return this.findUsersService.checkUsernameAvailability(username);
  }

  async getUserStatistics(): Promise<UserStatistics> {
    this.logger.debug('Getting user statistics');
    return this.findUsersService.getUserStatistics();
  }

  async getRecentlyCreated(limit: number = 10): Promise<UserResponseDto[]> {
    this.logger.debug(`Getting recently created users (limit: ${limit})`);
    return this.findUsersService.getRecentlyCreated(limit);
  }
}
