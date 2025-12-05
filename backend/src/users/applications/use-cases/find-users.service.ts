// application/use-cases/find-users.service.ts

import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FindUsersQueryDto } from '../dto/find-users-query.dto';
import { UserRepository } from '../../infrastructures/repositories/user.repository';
import { UserMapper } from '../../domains/mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '../../domains/entities/user.entity';

@Injectable()
export class FindUsersService {
    private readonly logger = new Logger(FindUsersService.name);

    constructor(private readonly userRepository: UserRepository) { }

    /**
     * Find all users with pagination, filters, and search
     */
    async findAll(query: FindUsersQueryDto): Promise<{
        data: UserResponseDto[];
        meta: any;
    }> {
        try {
            // Log debug tidak masalah, tapi hati-hati jika query object membesar
            this.logger.debug(`Finding users with query: ${JSON.stringify(query)}`);

            const page = query.page || 1;
            const limit = query.limit || 10;
            const skip = (page - 1) * limit;

            const [users, total] = await this.userRepository.findAndCountUsers({
                skip,
                take: limit,
                search: query.search,
                role: query.role,
                isActive: query.isActive,
            });

            this.logger.log(`📋 Retrieved ${users.length} users (Total: ${total})`);

            return {
                data: UserMapper.toResponseDtoArray(users),
                meta: {
                    total,
                    page,
                    limit,
                    lastPage: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            this.logger.error('Error fetching users:', error);
            // [FIX] Jangan ekspos error.message asli ke user (bisa bocor info database)
            throw new BadRequestException('Gagal mengambil daftar users. Silakan coba lagi.');
        }
    }

    /**
     * Find single user by ID
     */
    async findOne(userId: number): Promise<UserResponseDto> {
        try {
            const user = await this.userRepository.findById(userId);

            if (!user) {
                throw new NotFoundException(`User dengan ID #${userId} tidak ditemukan`);
            }

            return UserMapper.toResponseDto(user);
        } catch (error) {
            // Re-throw jika itu adalah HttpException (seperti NotFoundException di atas)
            if (error instanceof NotFoundException) throw error;
            
            this.logger.error(`Error finding user ID ${userId}:`, error);
            throw new InternalServerErrorException('Terjadi kesalahan saat mengambil data user');
        }
    }

    /**
     * Find user for authentication (by ID)
     */
    async findOneForAuth(userId: number): Promise<User> {
        try {
            const user = await this.userRepository.findByIdWithPassword(userId);

            if (!user) {
                throw new NotFoundException(`User dengan ID #${userId} tidak ditemukan`);
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Error finding user for auth ID ${userId}:`, error);
            throw new InternalServerErrorException('Gagal memverifikasi user');
        }
    }

    /**
     * [FIX UTAMA] Find user by Username OR Email
     * Digunakan oleh LoginService
     */
    async findByUsernameOrEmailForAuth(identifier: string): Promise<User> {
        // Kita panggil method baru di repository (pastikan Anda sudah update repository juga)
        const user = await this.userRepository.findByUsernameOrEmailWithPassword(identifier);

        if (!user) {
            // Pesan error umum untuk keamanan (jangan spesifik "Username salah" atau "Email salah")
            throw new NotFoundException('User tidak ditemukan');
        }

        return user;
    }

    /**
     * Check username availability
     */
    async checkUsernameAvailability(username: string): Promise<{
        available: boolean;
        message: string;
    }> {
        try {
            const exists = await this.userRepository.usernameExists(username);

            return {
                available: !exists,
                message: exists
                    ? `Username "${username}" sudah digunakan`
                    : `Username "${username}" tersedia`
            };
        } catch (error) {
            this.logger.error('Error checking username availability:', error);
            throw new BadRequestException('Gagal memeriksa ketersediaan username');
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
            return await this.userRepository.getStatistics();
        } catch (error) {
            this.logger.error('Error getting user statistics:', error);
            throw new BadRequestException('Gagal mengambil statistik users');
        }
    }

    /**
     * Get recently created users
     */
    async getRecentlyCreated(limit: number = 10): Promise<UserResponseDto[]> {
        try {
            // Validasi limit sebaiknya di Controller/DTO, tapi double check disini tidak apa-apa
            if (limit < 1 || limit > 50) {
                limit = 10; // Fallback ke default daripada error
            }

            const users = await this.userRepository.findRecentlyCreated(limit);
            return UserMapper.toResponseDtoArray(users);
        } catch (error) {
            this.logger.error('Error getting recently created users:', error);
            throw new BadRequestException('Gagal mengambil daftar user terbaru');
        }
    }
}