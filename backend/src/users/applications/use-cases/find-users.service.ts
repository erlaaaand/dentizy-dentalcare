// application/use-cases/find-users.service.ts

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
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
    async findAll(query: FindUsersQueryDto): Promise<{ data: UserResponseDto[]; meta: any }> {
        try {
            this.logger.debug(`Finding users with query: ${JSON.stringify(query)}`);

            const page = query.page || 1;
            const limit = query.limit || 10;
            const skip = (page - 1) * limit;

            // Gunakan method baru findAndCountUsers
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
            this.logger.error('Error fetching users:', error.message);
            throw new BadRequestException('Gagal mengambil daftar users: ' + error.message);
        }
    }

    async findOne(userId: number): Promise<UserResponseDto> {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) throw new NotFoundException(`User dengan ID #${userId} tidak ditemukan`);
            return UserMapper.toResponseDto(user);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Error finding user ID ${userId}:`, error.message);
            throw new BadRequestException('Gagal mengambil data user');
        }
    }

    async findOneForAuth(userId: number): Promise<User> {
        try {
            const user = await this.userRepository.findByIdWithPassword(userId);
            if (!user) throw new NotFoundException(`User dengan ID #${userId} tidak ditemukan`);
            return user;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Error finding user for auth ID ${userId}:`, error.message);
            throw new BadRequestException('Gagal mengambil data user');
        }
    }

    public async findByUsernameForAuth(username: string): Promise<User> {
        const user = await this.userRepository.findByUsernameWithPassword(username);
        if (!user) throw new NotFoundException(`User dengan username "${username}" tidak ditemukan`);
        return user;
    }

    async checkUsernameAvailability(username: string): Promise<{ available: boolean; message: string }> {
        try {
            const exists = await this.userRepository.usernameExists(username);
            return {
                available: !exists,
                message: exists ? `Username "${username}" sudah digunakan` : `Username "${username}" tersedia`
            };
        } catch (error) {
            this.logger.error('Error checking username availability:', error.message);
            throw new BadRequestException('Gagal memeriksa ketersediaan username');
        }
    }

    async getUserStatistics(): Promise<{ total: number; byRole: Record<string, number>; active: number; inactive: number; }> {
        try {
            // Pastikan method ini ada di Repository atau implementasi ulang di sini
            // Jika repository belum punya getStatistics yang lengkap, kita bisa pakai logic manual:

            // OPSI 1: Jika Repository punya getStatistics (Disarankan)
            return await this.userRepository.getStatistics();

            // OPSI 2 (Fallback jika repo belum siap):
            /*
            const [total, active, inactive] = await Promise.all([
                this.userRepository.count(),
                this.userRepository.count({ where: { is_active: true } }),
                this.userRepository.count({ where: { is_active: false } })
            ]);
            // byRole butuh query builder khusus
            return { total, active, inactive, byRole: {} };
            */
        } catch (error) {
            this.logger.error('Error getting user statistics:', error.message);
            throw new BadRequestException('Gagal mengambil statistik users');
        }
    }

    async getRecentlyCreated(limit: number = 10): Promise<UserResponseDto[]> {
        try {
            if (limit < 1 || limit > 50) throw new BadRequestException('Limit harus antara 1 dan 50');

            // Gunakan method findRecentlyCreated dari repository
            const users = await this.userRepository.findRecentlyCreated(limit);
            return UserMapper.toResponseDtoArray(users);
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            this.logger.error('Error getting recently created users:', error.message);
            throw new BadRequestException('Gagal mengambil daftar user terbaru');
        }
    }
}