import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../../../applications/orchestrator/users.service';
import { BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../../auth/interface/guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

import { AuthService } from '../../../../auth/applications/orchestrator/auth.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()], // Untuk CacheInterceptor
      controllers: [UsersController],
      providers: [
        // Mock untuk UsersService (index 0)
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            changePassword: jest.fn(),
            resetPassword: jest.fn(),
            generateTemporaryPassword: jest.fn()
          }
        },

        // [PERBAIKAN] 2. Tambahkan mock untuk AuthService (index 1)
        {
          provide: AuthService,
          useValue: {
            // Sediakan mock method yang MUNGKIN dipanggil oleh controller
            // Jika tidak ada, objek kosong {} saja sudah cukup untuk DI
            validateUser: jest.fn(),
            login: jest.fn(),
          }
        },

        // Mock Guards
        {
          provide: AuthGuard('jwt'),
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: ThrottlerGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ]
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  // ... Sisa tes Anda (it, describe) tidak perlu diubah ...

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'Password123!',
        nama_lengkap: 'Test User',
        roles: [1]
      };

      const expectedResult = {
        id: 1,
        username: 'testuser',
        nama_lengkap: 'Test User',
        roles: [{ id: 1, name: 'staf', description: 'Staf' }],
        created_at: new Date(),
        updated_at: new Date()
      };

      usersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const user = { id: 1, username: 'testuser' } as any;
      const changePasswordDto = {
        oldPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      };

      const expectedResult = {
        message: 'Password berhasil diubah',
        timestamp: expect.any(String),
        user: { id: 1, username: 'testuser' }
      };

      usersService.changePassword.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(user, changePasswordDto);

      expect(result).toEqual(expectedResult);
      expect(usersService.changePassword).toHaveBeenCalledWith(
        1,
        'OldPass123!',
        'NewPass123!'
      );
    });

    it('should throw error if passwords do not match', async () => {
      const user = { id: 1, username: 'testuser' } as any;
      const changePasswordDto = {
        oldPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmPassword: 'DifferentPass123!'
      };

      await expect(
        controller.changePassword(user, changePasswordDto)
      ).rejects.toThrow(BadRequestException);

      expect(usersService.changePassword).not.toHaveBeenCalled();
    });
  });
});