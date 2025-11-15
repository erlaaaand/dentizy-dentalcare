// infrastructure/repositories/user.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../domains/entities/user.entity';
import { Role } from '../../../roles/entities/role.entity';
import { FindUsersQueryDto } from '../../applications/dto/find-users-query.dto';

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
     */
    async create(data: {
        username: string;
        nama_lengkap: string;
        password: string;
        roles: Role[];
    }): Promise<User> {
        const user = this.repository.create({
            username: data.username,
            nama_lengkap: data.nama_lengkap,
            password: data.password,
            roles: data.roles
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
     * Find all users with optional role filter
     */
    async findAll(query: FindUsersQueryDto): Promise<User[]> {
        const queryBuilder = this.repository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .select([
                'user.id',
                'user.username',
                'user.nama_lengkap',
                'user.created_at',
                'user.updated_at',
                'user.profile_photo',
                'role.id',
                'role.name',
                'role.description'
            ]);

        if (query.role) {
            queryBuilder.where('role.name = :roleName', { roleName: query.role });
        }

        return queryBuilder.getMany();
    }

    /**
     * Find user by ID
     */
    async findById(id: number): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['roles'],
            select: {
                id: true,
                username: true,
                nama_lengkap: true,
                created_at: true,
                updated_at: true,
                profile_photo: true
            }
        });
    }

    /**
     * Find user by ID with password (for authentication)
     */
    async findByIdWithPassword(id: number): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['roles']
        });
    }

    /**
     * Find user by username without password
     */
    async findByUsernameWithoutPassword(username: string): Promise<User | null> {
        return this.repository.findOne({
            where: { username },
            relations: ['roles'],
            select: {
                id: true,
                username: true,
                nama_lengkap: true,
                created_at: true,
                updated_at: true,
                profile_photo: true
            }
        });
    }

    /**
     * Find user by username with password (for authentication)
     */
    async findByUsernameWithPassword(username: string): Promise<User | null> {
        return this.repository
            .createQueryBuilder('user') // Gunakan Query Builder
            .where('user.username = :username', { username })
            .addSelect('user.password') // <-- PAKSA 'select' kolom password
            .leftJoinAndSelect('user.roles', 'role') // Load relasi roles
            .getOne(); // Ambil hasilnya
    }

    /**
     * Search users by name (partial match)
     */
    async searchByName(searchTerm: string): Promise<User[]> {
        return this.repository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .where('LOWER(user.nama_lengkap) LIKE LOWER(:searchTerm)', {
                searchTerm: `%${searchTerm}%`
            })
            .orWhere('LOWER(user.username) LIKE LOWER(:searchTerm)', {
                searchTerm: `%${searchTerm}%`
            })
            .select([
                'user.id',
                'user.username',
                'user.nama_lengkap',
                'user.created_at',
                'user.updated_at',
                'user.profile_photo',
                'role.id',
                'role.name',
                'role.description'
            ])
            .orderBy('user.nama_lengkap', 'ASC')
            .getMany();
    }

    /**
     * Check if username exists
     */
    async usernameExists(username: string): Promise<boolean> {
        const count = await this.repository.count({
            where: { username }
        });
        return count > 0;
    }

    /**
     * Find roles by IDs
     */
    async findRolesByIds(roleIds: number[]): Promise<Role[]> {
        return this.roleRepository.findBy({
            id: In(roleIds)
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

        // Count by role
        const roleStats = await this.repository
            .createQueryBuilder('user')
            .leftJoin('user.roles', 'role')
            .select('role.name', 'roleName')
            .addSelect('COUNT(user.id)', 'count')
            .groupBy('role.name')
            .getRawMany();

        const byRole: Record<string, number> = {};
        roleStats.forEach(stat => {
            byRole[stat.roleName || 'No Role'] = parseInt(stat.count);
        });

        return {
            total,
            byRole,
            active: total, // Implement actual active logic if needed
            inactive: 0    // Implement actual inactive logic if needed
        };
    }

    /**
     * Find with pagination
     */
    async findWithPagination(
        page: number,
        limit: number,
        query?: FindUsersQueryDto
    ): Promise<{
        data: User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const queryBuilder = this.repository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .select([
                'user.id',
                'user.username',
                'user.nama_lengkap',
                'user.created_at',
                'user.updated_at',
                'user.profile_photo',
                'role.id',
                'role.name',
                'role.description'
            ]);

        if (query?.role) {
            queryBuilder.where('role.name = :roleName', { roleName: query.role });
        }

        const total = await queryBuilder.getCount();
        const skip = (page - 1) * limit;

        const data = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('user.created_at', 'DESC')
            .getMany();

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Find recently created users
     */
    async findRecentlyCreated(limit: number): Promise<User[]> {
        return this.repository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .select([
                'user.id',
                'user.username',
                'user.nama_lengkap',
                'user.created_at',
                'user.updated_at',
                'user.profile_photo',
                'role.id',
                'role.name',
                'role.description'
            ])
            .orderBy('user.created_at', 'DESC')
            .take(limit)
            .getMany();
    }

    /**
     * Find users by IDs
     */
    async findByIds(userIds: number[]): Promise<User[]> {
        return this.repository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .whereInIds(userIds)
            .select([
                'user.id',
                'user.username',
                'user.nama_lengkap',
                'user.created_at',
                'user.updated_at',
                'user.profile_photo',
                'role.id',
                'role.name',
                'role.description'
            ])
            .getMany();
    }
}