// interface/http/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../../applications/orchestrator/users.service';
import { BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
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
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

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
        timestamp: new Date().toISOString(),
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
    });
  });
});