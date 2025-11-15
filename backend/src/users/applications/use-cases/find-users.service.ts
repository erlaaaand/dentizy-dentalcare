// application/use-cases/find-users.service.ts
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { FindUsersQueryDto } from '../dto/find-users-query.dto';
import { UserRepository } from '../../infrastructures/repositories/user.repository';
import { UserMapper } from '../../domains/mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class FindUsersService {
    private readonly logger = new Logger(FindUsersService.name);

    constructor(private readonly userRepository: UserRepository) { }

    /**
     * Find all users with optional filters
     */
    async findAll(query: FindUsersQueryDto): Promise<UserResponseDto[]> {
        try {
            this.logger.debug(`Finding users with query: ${JSON.stringify(query)}`);

            const users = await this.userRepository.findAll(query);

            this.logger.log(`📋 Retrieved ${users.length} users`);

            return UserMapper.toResponseDtoArray(users);
        } catch (error) {
            this.logger.error('Error fetching users:', error.message);
            throw new BadRequestException('Gagal mengambil daftar users');
        }
    }

    /**
     * Find user by ID
     */
    async findOne(userId: number): Promise<UserResponseDto> {
        try {
            this.logger.debug(`Finding user by ID: ${userId}`);

            const user = await this.userRepository.findById(userId);

            if (!user) {
                throw new NotFoundException(`User dengan ID #${userId} tidak ditemukan`);
            }

            this.logger.debug(`Found user: ${user.username}`);

            return UserMapper.toResponseDto(user);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.error(`Error finding user ID ${userId}:`, error.message);
            throw new BadRequestException('Gagal mengambil data user');
        }
    }

    /**
     * Find user by username
     */
    async findByUsername(username: string): Promise<UserResponseDto> {
        try {
            this.logger.debug(`Finding user by username: ${username}`);

            const user = await this.userRepository.findByUsernameWithoutPassword(username);

            if (!user) {
                throw new NotFoundException(`User dengan username "${username}" tidak ditemukan`);
            }

            this.logger.debug(`Found user: ${user.username}`);

            return UserMapper.toResponseDto(user);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.error(`Error finding user by username ${username}:`, error.message);
            throw new BadRequestException('Gagal mengambil data user');
        }
    }

    /**
     * Find users by role
     */
    async findByRole(roleName: string): Promise<UserResponseDto[]> {
        try {
            this.logger.debug(`Finding users by role: ${roleName}`);

            const users = await this.userRepository.findAll({ role: roleName as any });

            this.logger.log(`📋 Found ${users.length} users with role ${roleName}`);

            return UserMapper.toResponseDtoArray(users);
        } catch (error) {
            this.logger.error(`Error finding users by role ${roleName}:`, error.message);
            throw new BadRequestException('Gagal mengambil daftar users berdasarkan role');
        }
    }

    /**
     * Search users by name
     */
    async searchByName(searchTerm: string): Promise<UserResponseDto[]> {
        try {
            this.logger.debug(`Searching users by name: ${searchTerm}`);

            if (!searchTerm || searchTerm.trim().length === 0) {
                throw new BadRequestException('Search term tidak boleh kosong');
            }

            if (searchTerm.length < 2) {
                throw new BadRequestException('Search term minimal 2 karakter');
            }

            const users = await this.userRepository.searchByName(searchTerm);

            this.logger.log(`🔍 Found ${users.length} users matching "${searchTerm}"`);

            return UserMapper.toResponseDtoArray(users);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error(`Error searching users by name:`, error.message);
            throw new BadRequestException('Gagal mencari users');
        }
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
        try {
            this.logger.debug('Getting user statistics');

            const stats = await this.userRepository.getStatistics();

            this.logger.log(`📊 User statistics retrieved`);

            return stats;
        } catch (error) {
            this.logger.error('Error getting user statistics:', error.message);
            throw new BadRequestException('Gagal mengambil statistik users');
        }
    }

    /**
     * Check if username exists
     */
    async checkUsernameAvailability(username: string): Promise<{
        available: boolean;
        message: string;
    }> {
        try {
            this.logger.debug(`Checking username availability: ${username}`);

            const exists = await this.userRepository.usernameExists(username);

            return {
                available: !exists,
                message: exists
                    ? `Username "${username}" sudah digunakan`
                    : `Username "${username}" tersedia`
            };
        } catch (error) {
            this.logger.error('Error checking username availability:', error.message);
            throw new BadRequestException('Gagal memeriksa ketersediaan username');
        }
    }

    /**
     * Get users with pagination
     */
    async findWithPagination(
        page: number = 1,
        limit: number = 10,
        query?: FindUsersQueryDto
    ): Promise<{
        data: UserResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        try {
            this.logger.debug(`Finding users with pagination: page=${page}, limit=${limit}`);

            // Validate pagination params
            if (page < 1) {
                throw new BadRequestException('Page harus lebih dari 0');
            }

            if (limit < 1 || limit > 100) {
                throw new BadRequestException('Limit harus antara 1 dan 100');
            }

            const result = await this.userRepository.findWithPagination(page, limit, query);

            this.logger.log(`📋 Retrieved page ${page} with ${result.data.length} users`);

            return {
                data: UserMapper.toResponseDtoArray(result.data),
                meta: result.meta
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error('Error finding users with pagination:', error.message);
            throw new BadRequestException('Gagal mengambil daftar users');
        }
    }

    /**
     * Get recently created users
     */
    async getRecentlyCreated(limit: number = 10): Promise<UserResponseDto[]> {
        try {
            this.logger.debug(`Getting ${limit} recently created users`);

            if (limit < 1 || limit > 50) {
                throw new BadRequestException('Limit harus antara 1 dan 50');
            }

            const users = await this.userRepository.findRecentlyCreated(limit);

            this.logger.log(`📋 Retrieved ${users.length} recently created users`);

            return UserMapper.toResponseDtoArray(users);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error('Error getting recently created users:', error.message);
            throw new BadRequestException('Gagal mengambil daftar user terbaru');
        }
    }

    /**
     * Get users by IDs (batch)
     */
    async findByIds(userIds: number[]): Promise<UserResponseDto[]> {
        try {
            this.logger.debug(`Finding users by IDs: ${userIds.join(', ')}`);

            if (!userIds || userIds.length === 0) {
                return [];
            }

            if (userIds.length > 100) {
                throw new BadRequestException('Maksimal 100 user IDs per request');
            }

            const users = await this.userRepository.findByIds(userIds);

            this.logger.log(`📋 Found ${users.length} users from ${userIds.length} IDs`);

            return UserMapper.toResponseDtoArray(users);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error('Error finding users by IDs:', error.message);
            throw new BadRequestException('Gagal mengambil daftar users');
        }
    }
}