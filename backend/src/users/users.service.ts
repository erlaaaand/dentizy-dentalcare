import { Injectable, NotFoundException } from '@nestjs/common';
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
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { roles: roleIds, password, ...userData } = createUserDto;

        const roles = await this.roleRepository.findBy({ id: In(roleIds) });
        if (roles.length !== roleIds.length) {
            throw new NotFoundException('Satu atau lebih role tidak ditemukan');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = this.userRepository.create({
            ...userData,
            password: hashedPassword,
            roles,
        });

        return this.userRepository.save(newUser);
    }

    /**
     * Mengambil daftar pengguna, dengan kemampuan filter berdasarkan peran.
     * @param query - Objek yang mungkin berisi filter 'role'.
     */
    async findAll(query: FindUsersQueryDto): Promise<User[]> {
        const queryBuilder = this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role');

        // Jika ada parameter 'role' di query, tambahkan filter
        if (query.role) {
            queryBuilder.where('role.name = :roleName', { roleName: query.role });
        }

        const users = await queryBuilder.getMany();
        return users;
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['roles'],
        });
        if (!user) {
            throw new NotFoundException(`User dengan ID #${id} tidak ditemukan`);
        }
        return user;
    }

    async findOneByUsername(username: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { username },
            relations: ['roles'],
        });
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const { roles: roleIds, ...userData } = updateUserDto;
        const user = await this.findOne(id);

        if (roleIds) {
            const roles = await this.roleRepository.findBy({ id: In(roleIds) });
            if (roles.length !== roleIds.length) {
                throw new NotFoundException('Satu atau lebih role tidak ditemukan saat update');
            }
            user.roles = roles;
        }

        Object.assign(user, userData);
        return this.userRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
}
