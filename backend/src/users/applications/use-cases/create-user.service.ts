// application/use-cases/create-user.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../../infrastructures/repositories/user.repository';
import { UserValidationService } from '../../domains/services/user-validation.service';
import { PasswordHasherService } from '../../../auth/infrastructures/security/password-hasher.service';
import { UserMapper } from '../../domains/mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../infrastructures/events/user-created.event';

/**
 * CreateUserService - Pure business logic for user creation
 * Input: CreateUserDto (already validated by class-validator)
 * Output: UserResponseDto
 */
@Injectable()
export class CreateUserService {
    private readonly logger = new Logger(CreateUserService.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly userValidation: UserValidationService,
        private readonly passwordHasher: PasswordHasherService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const { roles: roleIds, password, username, nama_lengkap } = createUserDto;

        try {
            // 1. Check username uniqueness (business rule)
            const existingUser = await this.userRepository.findByUsernameWithoutPassword(username);
            this.userValidation.validateUsernameUniqueness(existingUser, username);

            // 2. Validate roles exist (business rule)
            const roles = await this.userRepository.findRolesByIds(roleIds);
            this.userValidation.validateRolesExist(roleIds, roles);

            // 3. Hash password (security operation)
            const hashedPassword = await this.passwordHasher.hash(password);

            // 4. Create user entity
            const newUser = await this.userRepository.create({
                username,
                nama_lengkap,
                password: hashedPassword,
                roles
            });

            // 5. Emit domain event
            this.eventEmitter.emit(
                'user.created',
                new UserCreatedEvent(
                    newUser.id,
                    newUser.username,
                    newUser.nama_lengkap,
                    newUser.roles.map(r => r.name)
                )
            );

            // 6. Log success
            this.logger.log(`✅ User created: ${newUser.username} (ID: ${newUser.id})`);

            // 7. Map to DTO and return
            return UserMapper.toResponseDto(newUser);

        } catch (error) {
            this.logger.error('Error creating user:', error.message);
            throw error;
        }
    }
}