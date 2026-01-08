import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../../infrastructures/repositories/user.repository';
import { UserValidationService } from '../../domains/services/user-validation.service';
import { PasswordHasherService } from '../../../auth/infrastructures/security/password-hasher.service';
import { UserMapper } from '../../domains/mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../infrastructures/events/user-created.event';

@Injectable()
export class CreateUserService {
  private readonly logger = new Logger(CreateUserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userValidation: UserValidationService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // [FIX] Hapus specialization dari destructuring
    const {
      roles: roleIds,
      password,
      username,
      nama_lengkap,
      email,
    } = createUserDto;

    try {
      const existingUser =
        await this.userRepository.findByUsernameWithoutPassword(username);
      this.userValidation.validateUsernameUniqueness(existingUser, username);

      if (email) {
        await this.userValidation.validateUniqueEmail(email);
      }

      const roles = await this.userRepository.findRolesByIds(roleIds);
      this.userValidation.validateRolesExist(roleIds, roles);

      const hashedPassword = await this.passwordHasher.hash(password);

      const newUser = await this.userRepository.create({
        username,
        nama_lengkap,
        password: hashedPassword,
        roles,
        email: email || null,
        // [FIX] Hapus specialization dari payload create
      } as any);

      this.eventEmitter.emit(
        'user.created',
        new UserCreatedEvent(
          newUser.id,
          newUser.username,
          newUser.nama_lengkap,
          newUser.roles.map((r) => r.name),
        ),
      );

      this.logger.log(
        `✅ User created: ${newUser.username} (ID: ${newUser.id})`,
      );
      return UserMapper.toResponseDto(newUser);
    } catch (error) {
      this.logger.error('Error creating user:', error.message);
      throw error;
    }
  }
}
