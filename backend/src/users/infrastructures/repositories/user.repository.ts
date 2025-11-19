// infrastructure/repositories/user.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../domains/entities/user.entity';
import { Role } from '../../../roles/entities/role.entity';
// Pastikan Anda import DTO Enhanced yang baru
// import { FindUsersQueryDto } from '../../applications/dto/find-users-query.dto'; 

@Injectable()
export class UserRepository {
    private readonly logger = new Logger(UserRepository.name);

    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    // ... (Method create, update, delete TETAP SAMA) ...

    /**
     * Find all users with advanced filtering (search, role, active status, pagination)
     * REPLACES: findAll (old), searchByName, findWithPagination
     */
    async findAndCountUsers(params: {
        skip: number;
        take: number;
        search?: string;
        role?: any; // Sesuaikan dengan tipe Enum Role Anda
        isActive?: boolean;
    }): Promise<[User[], number]> {
        const qb = this.repository.createQueryBuilder('user');

        // 1. Join Role (Wajib untuk response lengkap & filter role)
        qb.leftJoinAndSelect('user.roles', 'role');

        // 2. Select Fields (Optimasi payload)
        qb.select([
            'user.id', 'user.username', 'user.nama_lengkap',
            'user.created_at', 'user.updated_at', 'user.profile_photo',
            'user.is_active', // Pastikan field ini ada di Entity!
            'role.id', 'role.name', 'role.description'
        ]);

        // 3. Filter Search (Partial Match pada Nama ATAU Username)
        if (params.search) {
            qb.andWhere(
                '(LOWER(user.nama_lengkap) LIKE LOWER(:search) OR LOWER(user.username) LIKE LOWER(:search))',
                { search: `%${params.search}%` }
            );
        }

        // 4. Filter Role
        if (params.role) {
            qb.andWhere('role.name = :roleName', { roleName: params.role });
        }

        // 5. Filter Active Status
        if (params.isActive !== undefined) {
            qb.andWhere('user.is_active = :isActive', { isActive: params.isActive });
        }

        // 6. Pagination & Sorting
        qb.orderBy('user.created_at', 'DESC')
            .skip(params.skip)
            .take(params.take);

        // 7. Execute
        return qb.getManyAndCount();
    }

    /**
     * Find users by IDs (Helper)
     */
    async findByIds(userIds: number[]): Promise<User[]> {
        return this.repository.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .whereInIds(userIds)
            .getMany();
    }

    async findById(id: number): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['roles']
        });
    }

    async findByIdWithPassword(id: number): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['roles'],
            // Pastikan select password jika kolomnya @Exclude
            select: ['id', 'username', 'password', 'nama_lengkap', 'is_active'] // Sesuaikan
        });
    }

    async findByUsernameWithPassword(username: string): Promise<User | null> {
        return this.repository.findOne({
            where: { username },
            relations: ['roles'],
            // Tambahkan addSelect jika pakai QueryBuilder, atau select manual
            select: {
                id: true, username: true, password: true, nama_lengkap: true, roles: true, is_active: true
            }
        });
    }

    async usernameExists(username: string): Promise<boolean> {
        const count = await this.repository.count({ where: { username } });
        return count > 0;
    }

    async findRecentlyCreated(limit: number): Promise<User[]> {
        return this.repository.find({
            order: { created_at: 'DESC' },
            take: limit,
            relations: ['roles']
        });
    }

    async getStatistics() {
        const total = await this.repository.count();
        const active = await this.repository.count({ where: { is_active: true } });
        const inactive = await this.repository.count({ where: { is_active: false } });

        // Contoh simple byRole (bisa dioptimalkan dengan QueryBuilder groupBy)
        const byRole = {};

        return { total, active, inactive, byRole };
    }
}