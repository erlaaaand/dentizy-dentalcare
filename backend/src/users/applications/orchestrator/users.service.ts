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

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly createUserService: CreateUserService,
        private readonly updateUserService: UpdateUserService,
        private readonly deleteUserService: DeleteUserService,
        private readonly findUsersService: FindUsersService,
        private readonly changePasswordService: ChangePasswordService,
        private readonly resetPasswordService: ResetPasswordService
    ) { }

    /**
     * Create new user
     */
    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.createUserService.execute(createUserDto);
    }

    /**
     * Find all users with optional filters, search, and pagination
     * Delegated fully to FindUsersService use case.
     */
    async findAll(query: FindUsersQueryDto): Promise<{ data: UserResponseDto[], meta: any }> {
        return this.findUsersService.findAll(query);
    }

    /**
     * Find user by ID
     */
    async findOne(userId: number): Promise<UserResponseDto> {
        return this.findUsersService.findOne(userId);
    }

    /**
     * Find user by username (for auth)
     */
    async findOneByUsername(username: string): Promise<User | null> {
        return this.findUsersService.findByUsernameForAuth(username);
    }

    /**
     * Find user by ID (for auth strategies)
     */
    async findOneForAuth(userId: number): Promise<User | null> {
        return this.findUsersService.findOneForAuth(userId);
    }

    /**
     * Update user
     */
    async update(userId: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        return this.updateUserService.execute(userId, updateUserDto);
    }

    /**
     * Delete user
     */
    async remove(userId: number): Promise<{ message: string }> {
        return this.deleteUserService.execute(userId);
    }

    /**
     * Change password (user context)
     */
    async changePassword(
        userId: number,
        oldPassword: string,
        newPassword: string
    ): Promise<PasswordChangeResponseDto> {
        return this.changePasswordService.execute(userId, oldPassword, newPassword);
    }

    /**
     * Reset password (admin context)
     */
    async resetPassword(
        userId: number,
        newPassword: string
    ): Promise<PasswordChangeResponseDto> {
        return this.resetPasswordService.execute(userId, newPassword, true);
    }

    /**
     * Generate temporary password
     */
    async generateTemporaryPassword(userId: number): Promise<{
        temporaryPassword: string;
        message: string;
    }> {
        return this.resetPasswordService.generateTemporaryPassword(userId);
    }

    /**
     * Check username availability
     */
    async checkUsernameAvailability(username: string): Promise<{
        available: boolean;
        message: string;
    }> {
        return this.findUsersService.checkUsernameAvailability(username);
    }

    /**
     * Get user statistics
     */
    async getUserStatistics(): Promise<{
        total: number;
        byRole: Record<string, number>;
        active: number;
        inactive: number;
    }> {
        return this.findUsersService.getUserStatistics();
    }

    /**
     * Get recently created users
     */
    async getRecentlyCreated(limit: number = 10): Promise<UserResponseDto[]> {
        return this.findUsersService.getRecentlyCreated(limit);
    }
}