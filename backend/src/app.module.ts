// users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';

// Entities
import { User } from './users/domains/entities/user.entity';
import { Role } from './roles/entities/role.entity';

// Controllers
import { UsersController } from './users/interface/http/users.controller';

// Orchestrator
import { UsersService } from './users/applications/orchestrator/users.service';

// Use Cases
import { CreateUserService } from './users/applications/use-cases/create-user.service';
import { UpdateUserService } from './users/applications/use-cases/update-user.service';
import { DeleteUserService } from './users/applications/use-cases/delete-user.service';
import { FindUsersService } from './users/applications/use-cases/find-users.service';
import { ChangePasswordService } from './users/applications/use-cases/change-password.service';
import { ResetPasswordService } from './users/applications/use-cases/reset-password.service';

// Domain Services
import { UserValidationService } from './users/domains/services/user-validation.service';
import { PasswordPolicyService } from './users/domains/services/password-policy.service';

// Infrastructure
import { UserRepository } from './users/infrastructures/repositories/user.repository';

// Security Services from Auth Module
import { PasswordHasherService } from './auth/infrastructures/security/password-hasher.service';
import { TimingDefenseService } from './auth/infrastructures/security/timing-defense.service';

// Exception Filters
import { APP_FILTER } from '@nestjs/core';
import { UserExceptionFilter } from './users/interface/filters/user-exception.filter';
import { ValidationExceptionFilter } from './users/interface/filters/validation-exception.filter';

@Module({
  imports: [
    // Forward reference to avoid circular dependency
    forwardRef(() => AuthModule),

    // TypeORM entities
    TypeOrmModule.forFeature([User, Role]),

    // Event system
    EventEmitterModule.forRoot({
      // Use wildcards
      wildcard: true,
      // Set this to `true` to use wildcards
      delimiter: '.',
      // Maximum listeners for event emitter
      maxListeners: 10,
      // Show event name in memory leak message when more than maximum listeners
      verboseMemoryLeak: true,
    }),

    // Caching for GET endpoints
    CacheModule.register({
      ttl: 60, // seconds
      max: 100, // maximum items in cache
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10, // 10 requests per ttl
    }]),
  ],

  controllers: [UsersController],

  providers: [
    // ===== Orchestrator =====
    UsersService,

    // ===== Use Cases =====
    CreateUserService,
    UpdateUserService,
    DeleteUserService,
    FindUsersService,
    ChangePasswordService,
    ResetPasswordService,

    // ===== Domain Services =====
    UserValidationService,
    PasswordPolicyService,

    // ===== Infrastructure =====
    UserRepository,

    // ===== Shared Services from Auth Module =====
    PasswordHasherService,
    TimingDefenseService,

    // ===== Exception Filters =====
    {
      provide: APP_FILTER,
      useClass: UserExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],

  exports: [
    // Export orchestrator for other modules
    UsersService,

    // Export repository if needed by other modules
    UserRepository,
  ]
})
export class UsersModule { }