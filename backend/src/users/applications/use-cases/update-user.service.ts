// application/use-cases/update-user.service.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../../infrastructures/repositories/user.repository';
import { UserValidationService } from '../../domains/services/user-validation.service';
import { UserMapper } from '../../domains/mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserUpdatedEvent } from '../../infrastructures/events/user-updated.event';
import { UsernameValidator } from '../../domains/validators/username.validator';
import { UserDataValidator } from '../../domains/validators/user-data.validator';

@Injectable()
export class UpdateUserService {
    private readonly logger = new Logger(UpdateUserService.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly userValidation: UserValidationService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(userId: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const { roles: roleIds, username, nama_lengkap } = updateUserDto;

        try {
            // 1. Find user
            const user = await this.userRepository.findByIdWithPassword(userId);
            this.userValidation.validateUserExists(user, userId);

            if (!user) {
                throw new BadRequestException(`User with id ${userId} not found`);
            }

            const changes: Record<string, any> = {};

            // 2. Update username if provided
            if (username && username !== user.username) {
                UsernameValidator.validate(username);

                const existingUser = await this.userRepository.findByUsernameWithoutPassword(username);
                this.userValidation.validateUsernameUniqueness(
                    existingUser,
                    username,
                    user.username
                );

                user.username = username;
                changes.username = username;
            }

            // 3. Update nama_lengkap if provided
            if (nama_lengkap && nama_lengkap !== user.nama_lengkap) {
                UserDataValidator.validateNamaLengkap(nama_lengkap);
                user.nama_lengkap = nama_lengkap;
                changes.nama_lengkap = nama_lengkap;
            }

            // 4. Update roles if provided
            if (roleIds && roleIds.length > 0) {
                UserDataValidator.validateRoles(roleIds);

                const roles = await this.userRepository.findRolesByIds(roleIds);
                this.userValidation.validateRolesExist(roleIds, roles);

                user.roles = roles;
                changes.roles = roleIds;
            }

            // 5. Save changes
            const updatedUser = await this.userRepository.update(user);

            // 6. Emit event
            this.eventEmitter.emit(
                'user.updated',
                new UserUpdatedEvent(updatedUser.id, updatedUser.username, changes)
            );

            // 7. Log and return
            this.logger.log(`✅ User updated: ${updatedUser.username} (ID: ${updatedUser.id})`);
            return UserMapper.toResponseDto(updatedUser);

        } catch (error) {
            this.logger.error(`Error updating user ID ${userId}:`, error.message);
            throw error;
        }
    }
}