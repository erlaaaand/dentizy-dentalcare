// application/use-cases/create-user.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../../infrastructures/repositories/user.repository';
import { UserValidationService } from '../../domains/services/user-validation.service';
import { PasswordHasherService } from '../../../auth/infrastructures/security/password-hasher.service';
import { UserMapper } from '../../domains/mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../infrastructures/events/user-created.event';
import { UsernameValidator } from '../../domains/validators/username.validator';
import { UserDataValidator } from '../../domains/validators/user-data.validator';

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
            // 1. Validate input data
            UsernameValidator.validate(username);
            UserDataValidator.validateNamaLengkap(nama_lengkap);
            UserDataValidator.validateRoles(roleIds);

            // 2. Check username uniqueness
            const existingUser = await this.userRepository.findByUsernameWithoutPassword(username);
            this.userValidation.validateUsernameUniqueness(existingUser, username);

            // 3. Validate roles exist
            const roles = await this.userRepository.findRolesByIds(roleIds);
            this.userValidation.validateRolesExist(roleIds, roles);

            // 4. Hash password
            const hashedPassword = await this.passwordHasher.hash(password);

            // 5. Create user
            const newUser = await this.userRepository.create({
                username,
                nama_lengkap,
                password: hashedPassword,
                roles
            });

            // 6. Emit event
            this.eventEmitter.emit(
                'user.created',
                new UserCreatedEvent(
                    newUser.id,
                    newUser.username,
                    newUser.nama_lengkap,
                    newUser.roles.map(r => r.name)
                )
            );

            // 7. Log and return
            this.logger.log(`✅ User created: ${newUser.username} (ID: ${newUser.id})`);
            return UserMapper.toResponseDto(newUser);

        } catch (error) {
            this.logger.error('Error creating user:', error.message);
            throw error;
        }
    }
}