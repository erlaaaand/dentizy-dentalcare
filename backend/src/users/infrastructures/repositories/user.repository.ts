// infrastructure/repositories/user.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../domains/entities/user.entity';
import { Role } from '../../../roles/entities/role.entity';
import { UserRole } from '../../../roles/entities/role.entity';

@Injectable()
export class UserRepository {
    private readonly logger = new Logger(UserRepository.name);

    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    /**
     * Create new user
     * [FIX] Tambahkan email ke parameter dan payload creation
     */
    async create(data: {
        username: string;
        nama_lengkap: string;
        password: string;
        roles: Role[];
        email?: string | null; // <--- Tambahkan ini
    }): Promise<User> {
        const user = this.repository.create({
            username: data.username,
            nama_lengkap: data.nama_lengkap,
            password: data.password,
            roles: data.roles,
            email: data.email, // <--- Pastikan ini ikut disimpan
            is_active: true
        });

        return this.repository.save(user);
    }

    /**
     * Update user
     */
    async update(user: User): Promise<User> {
        return this.repository.save(user);
    }

    /**
     * Delete user
     */
    async delete(user: User): Promise<void> {
        await this.repository.remove(user);
    }

    /**
     * Find and count users with advanced filtering
     * Used by FindUsersQueryDto
     */
    async findAndCountUsers(params: {
        skip: number;
        take: number;
        search?: string;
        role?: UserRole;
        isActive?: boolean;
    }): Promise<[User[], number]> {
        const qb = this.repository.createQueryBuilder('user');

        // Join roles
        qb.leftJoinAndSelect('user.roles', 'role');

        // Select fields (exclude password)
        qb.select([
            'user.id',
            'user.username',
            'user.nama_lengkap',
            'user.email', // [OPTIONAL] Tambahkan ini jika ingin email muncul di list
            'user.created_at',
            'user.updated_at',
            'user.profile_photo',
            'user.is_active',
            'role.id',
            'role.name',
            'role.description'
        ]);

        // Filter by search (nama_lengkap OR username OR email)
        if (params.search) {
            qb.andWhere(
                '(LOWER(user.nama_lengkap) LIKE LOWER(:search) OR LOWER(user.username) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
                { search: `%${params.search}%` }
            );
        }

        // Filter by role
        if (params.role) {
            qb.andWhere('role.name = :roleName', { roleName: params.role });
        }

        // Filter by active status
        if (params.isActive !== undefined) {
            qb.andWhere('user.is_active = :isActive', { isActive: params.isActive });
        }

        // Pagination & sorting
        qb.orderBy('user.created_at', 'DESC')
            .skip(params.skip)
            .take(params.take);

        return qb.getManyAndCount();
    }

    /**
     * Find user by ID (without password)
     */
    async findById(id: number): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['roles'],
            select: [
                'id',
                'username',
                'nama_lengkap',
                'email', // [FIX] Agar saat edit data, emailnya terambil
                'created_at',
                'updated_at',
                'profile_photo',
                'is_active'
            ]
        });
    }

    /**
     * Find user by ID (with password) - for password operations
     */
    async findByIdWithPassword(id: number): Promise<User | null> {
        return this.repository.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .where('user.id = :id', { id })
            .addSelect('user.password')
            .getOne();
    }

    /**
     * Find user by username (without password) - for username validation
     */
    async findByUsernameWithoutPassword(username: string): Promise<User | null> {
        return this.repository.findOne({
            where: { username },
            select: ['id', 'username']
        });
    }

    /**
     * [FIX] Find user by username OR email (with password) - for authentication
     * Sesuai rencana fitur login via email
     */
    async findByUsernameOrEmailWithPassword(identifier: string): Promise<User | null> {
        return this.repository.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .addSelect('user.password')
            .where('user.username = :identifier OR user.email = :identifier', { identifier })
            .getOne();
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({
            where: { email }
        });
    }

    /**
     * Check if username exists
     */
    async usernameExists(username: string): Promise<boolean> {
        const count = await this.repository.count({ where: { username } });
        return count > 0;
    }

    /**
     * Find roles by IDs
     */
    async findRolesByIds(roleIds: number[]): Promise<Role[]> {
        return this.roleRepository.find({
            where: { id: In(roleIds) }
        });
    }

    /**
     * Find recently created users
     */
    async findRecentlyCreated(limit: number): Promise<User[]> {
        return this.repository.find({
            order: { created_at: 'DESC' },
            take: limit,
            relations: ['roles'],
            select: [
                'id',
                'username',
                'nama_lengkap',
                'email',
                'created_at',
                'updated_at',
                'profile_photo',
                'is_active'
            ]
        });
    }

    /**
     * Get user statistics
     */
    async getStatistics(): Promise<{
        total: number;
        byRole: Record<string, number>;
        active: number;
        inactive: number;
    }> {
        const total = await this.repository.count();
        const active = await this.repository.count({ where: { is_active: true } });
        const inactive = await this.repository.count({ where: { is_active: false } });

        // Get count by role
        const roleStats = await this.repository
            .createQueryBuilder('user')
            .leftJoin('user.roles', 'role')
            .select('role.name', 'roleName')
            .addSelect('COUNT(DISTINCT user.id)', 'count')
            .groupBy('role.name')
            .getRawMany();

        const byRole: Record<string, number> = {};
        roleStats.forEach(stat => {
            if (stat.roleName) {
                byRole[stat.roleName] = parseInt(stat.count);
            }
        });

        return { total, active, inactive, byRole };
    }
}