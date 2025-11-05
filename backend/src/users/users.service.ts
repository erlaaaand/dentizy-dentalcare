import { 
    Injectable, 
    NotFoundException, 
    ConflictException,
    BadRequestException,
    Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    private readonly SALT_ROUNDS = 10;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    /**
     * Buat user baru
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        const { roles: roleIds, password, username, ...userData } = createUserDto;

        try {
            // 1. CEK: Username sudah ada atau belum
            const existingUser = await this.userRepository.findOne({
                where: { username }
            });

            if (existingUser) {
                throw new ConflictException(`Username "${username}" sudah digunakan`);
            }

            // 2. VALIDASI: Roles ada atau tidak
            const roles = await this.roleRepository.findBy({ id: In(roleIds) });
            
            if (roles.length !== roleIds.length) {
                const foundIds = roles.map(r => r.id);
                const missingIds = roleIds.filter(id => !foundIds.includes(id));
                throw new NotFoundException(
                    `Role dengan ID ${missingIds.join(', ')} tidak ditemukan`
                );
            }

            // 3. HASH PASSWORD
            const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

            // 4. BUAT USER BARU
            const newUser = this.userRepository.create({
                ...userData,
                username,
                password: hashedPassword,
                roles,
            });

            const savedUser = await this.userRepository.save(newUser);
            
            this.logger.log(`✅ User created: ${savedUser.username} (ID: ${savedUser.id})`);
            
            return savedUser;
            
        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            
            this.logger.error('Error creating user:', error);
            throw new BadRequestException('Gagal membuat user baru');
        }
    }

    /**
     * Ambil daftar users dengan filter role (opsional)
     */
    async findAll(query: FindUsersQueryDto): Promise<User[]> {
        try {
            const queryBuilder = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.roles', 'role')
                .select([
                    'user.id',
                    'user.username',
                    'user.nama_lengkap',
                    'user.created_at',
                    'user.updated_at',
                    'role.id',
                    'role.name',
                    'role.description'
                ]); // PENTING: Jangan select password!

            // Filter by role jika ada
            if (query.role) {
                queryBuilder.where('role.name = :roleName', { roleName: query.role });
            }

            const users = await queryBuilder.getMany();
            
            this.logger.log(`📋 Retrieved ${users.length} users`);
            
            return users;
            
        } catch (error) {
            this.logger.error('Error fetching users:', error);
            throw new BadRequestException('Gagal mengambil daftar users');
        }
    }

    /**
     * Ambil user by ID (WITH relations)
     */
    async findOne(id: number): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['roles'],
                select: {
                    id: true,
                    username: true,
                    nama_lengkap: true,
                    created_at: true,
                    updated_at: true,
                    // password TIDAK di-select
                },
            });

            if (!user) {
                throw new NotFoundException(`User dengan ID #${id} tidak ditemukan`);
            }

            return user;
            
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            this.logger.error(`Error finding user ID ${id}:`, error);
            throw new BadRequestException('Gagal mengambil data user');
        }
    }

    /**
     * Ambil user by username (untuk login)
     */
    async findOneByUsername(username: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findOne({
                where: { username },
                relations: ['roles'],
                // Di sini password PERLU di-select untuk validasi login
            });

            return user;
            
        } catch (error) {
            this.logger.error(`Error finding user by username ${username}:`, error);
            return null;
        }
    }

    /**
     * Update user
     */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const { roles: roleIds, username, ...userData } = updateUserDto;

        try {
            // 1. CEK: User ada atau tidak
            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['roles'],
            });

            if (!user) {
                throw new NotFoundException(`User dengan ID #${id} tidak ditemukan`);
            }

            // 2. CEK: Jika update username, pastikan tidak duplicate
            if (username && username !== user.username) {
                const existingUser = await this.userRepository.findOne({
                    where: { username }
                });

                if (existingUser) {
                    throw new ConflictException(`Username "${username}" sudah digunakan`);
                }
                
                user.username = username;
            }

            // 3. UPDATE ROLES jika ada
            if (roleIds && roleIds.length > 0) {
                const roles = await this.roleRepository.findBy({ id: In(roleIds) });
                
                if (roles.length !== roleIds.length) {
                    const foundIds = roles.map(r => r.id);
                    const missingIds = roleIds.filter(id => !foundIds.includes(id));
                    throw new NotFoundException(
                        `Role dengan ID ${missingIds.join(', ')} tidak ditemukan`
                    );
                }
                
                user.roles = roles;
            }

            // 4. UPDATE DATA LAINNYA
            Object.assign(user, userData);
            
            const updatedUser = await this.userRepository.save(user);
            
            this.logger.log(`User updated: ${updatedUser.username} (ID: ${updatedUser.id})`);
            
            return updatedUser;
            
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            
            this.logger.error(`Error updating user ID ${id}:`, error);
            throw new BadRequestException('Gagal mengupdate user');
        }
    }

    /**
     * Hapus user
     */
    async remove(id: number): Promise<void> {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['roles'],
            });

            if (!user) {
                throw new NotFoundException(`User dengan ID #${id} tidak ditemukan`);
            }

            // PERTIMBANGAN: Cek apakah user ini terkait dengan appointment atau medical record
            // Jika ya, mungkin lebih baik soft delete atau throw error

            await this.userRepository.remove(user);
            
            this.logger.log(`🗑️ User deleted: ${user.username} (ID: ${id})`);
            
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            this.logger.error(`Error deleting user ID ${id}:`, error);
            throw new BadRequestException('Gagal menghapus user');
        }
    }

    /**
     * FITUR BARU: Change password (untuk user yang sudah login)
     */
    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                throw new NotFoundException('User tidak ditemukan');
            }

            // Verifikasi password lama
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            
            if (!isPasswordValid) {
                throw new BadRequestException('Password lama tidak sesuai');
            }

            // Hash password baru
            user.password = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
            
            await this.userRepository.save(user);
            
            this.logger.log(`Password changed for user ID ${userId}`);
            
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            
            this.logger.error('Error changing password:', error);
            throw new BadRequestException('Gagal mengubah password');
        }
    }

    /**
     * FITUR BARU: Reset password (untuk admin)
     */
    async resetPassword(userId: number, newPassword: string): Promise<void> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                throw new NotFoundException(`User dengan ID #${userId} tidak ditemukan`);
            }

            user.password = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
            
            await this.userRepository.save(user);
            
            this.logger.log(`Password reset for user ID ${userId} by admin`);
            
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            this.logger.error('Error resetting password:', error);
            throw new BadRequestException('Gagal mereset password');
        }
    }
}