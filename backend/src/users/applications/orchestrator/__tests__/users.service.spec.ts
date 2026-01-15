// application/orchestrator/__tests__/users.service.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';

// Import dependencies (hanya sebagai token Injection)
import { CreateUserService } from '../../use-cases/create-user.service';
import { UpdateUserService } from '../../use-cases/update-user.service';
import { DeleteUserService } from '../../use-cases/delete-user.service';
import { FindUsersService } from '../../use-cases/find-users.service';
import { ChangePasswordService } from '../../use-cases/change-password.service';
import { ResetPasswordService } from '../../use-cases/reset-password.service';

// DTOs
import { FindUsersQueryDto } from '../../dto/find-users-query.dto';
import { CreateUserDto } from '../../dto/create-user.dto';

// 2. MOCK DATA
const mockQuery: FindUsersQueryDto = { page: 1, limit: 10, search: 'Dokter' };
const mockPaginationResult = {
  data: [{ id: 1, username: 'dr.budi' }],
  meta: { total: 1, page: 1, limit: 10 },
};
const mockUserResponse = { id: 1, username: 'test' };

// 3. TEST SUITE
describe('UsersService (Orchestrator)', () => {
  let service: UsersService;

  // Mock Dependencies
  let findUsersService: any;
  let createUserService: any;
  let updateUserService: any;
  let deleteUserService: any;
  let changePasswordService: any;
  let resetPasswordService: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Setup Mock Functions
    findUsersService = {
      findAll: jest.fn().mockResolvedValue(mockPaginationResult),
      findOne: jest.fn().mockResolvedValue(mockUserResponse),
      findByUsernameForAuth: jest.fn(),
      checkUsernameAvailability: jest.fn(),
      getUserStatistics: jest.fn(),
      getRecentlyCreated: jest.fn(),
      findOneForAuth: jest.fn(),
    };
    createUserService = {
      execute: jest.fn().mockResolvedValue(mockUserResponse),
    };
    updateUserService = { execute: jest.fn() };
    deleteUserService = { execute: jest.fn() };
    changePasswordService = { execute: jest.fn() };
    resetPasswordService = {
      execute: jest.fn(),
      generateTemporaryPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        // Inject Mocks
        { provide: FindUsersService, useValue: findUsersService },
        { provide: CreateUserService, useValue: createUserService },
        { provide: UpdateUserService, useValue: updateUserService },
        { provide: DeleteUserService, useValue: deleteUserService },
        { provide: ChangePasswordService, useValue: changePasswordService },
        { provide: ResetPasswordService, useValue: resetPasswordService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS (Delegation Checks)

  describe('findAll', () => {
    it('should delegate to FindUsersService.findAll with correct params', async () => {
      // Act
      const result = await service.findAll(mockQuery);

      // Assert
      expect(findUsersService.findAll).toHaveBeenCalledTimes(1);
      expect(findUsersService.findAll).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockPaginationResult);
    });
  });

  describe('create', () => {
    it('should delegate to CreateUserService.execute', async () => {
      const dto = { username: 'newuser' } as CreateUserDto;
      await service.create(dto);
      expect(createUserService.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should delegate to FindUsersService.findOne', async () => {
      await service.findOne(1);
      expect(findUsersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteUserService.execute', async () => {
      await service.remove(99);
      expect(deleteUserService.execute).toHaveBeenCalledWith(99);
    });
  });

  // Tambahkan test case lain jika perlu, polanya sama (Input -> Panggil Service -> Cek Mock)
});
