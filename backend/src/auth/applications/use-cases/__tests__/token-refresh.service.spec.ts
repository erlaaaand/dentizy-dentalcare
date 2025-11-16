// backend/src/auth/applications/use-cases/__tests__/token-refresh.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TokenRefreshService } from '../token-refresh.service';
import { UsersService } from '../../../../users/applications/orchestrator/users.service';
import { TokenService } from '../../../domains/services/token.service';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

// ======================
// MOCK DATA
// ======================
const mockUser: User = {
  id: 1,
  username: 'testuser',
  nama_lengkap: 'Test User',
  password: '$2b$10$hashedPassword',
  roles: [{ id: 1, name: UserRole.STAF, description: 'Staf' }],
} as User;

const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature';

// ======================
// TEST SUITE
// ======================
describe('TokenRefreshService', () => {
  let service: TokenRefreshService;
  let usersService: jest.Mocked<UsersService>;
  let tokenService: jest.Mocked<TokenService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  // ======================
  // SETUP AND TEARDOWN
  // ======================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRefreshService,
        {
          provide: UsersService,
          useValue: {
            findOneForAuth: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateToken: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenRefreshService>(TokenRefreshService);
    usersService = module.get(UsersService);
    tokenService = module.get(TokenService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ======================
  // EXECUTE METHOD TESTS
  // ======================
  describe('execute', () => {
    describe('Successful Token Refresh', () => {
      beforeEach(() => {
        usersService.findOneForAuth.mockResolvedValue(mockUser as any);
        tokenService.generateToken.mockReturnValue(mockAccessToken);
      });

      it('should successfully refresh token', async () => {
        const result = await service.execute(mockUser.id);

        expect(result).toEqual({
          access_token: mockAccessToken,
        });
      });

      it('should find user by id', async () => {
        await service.execute(mockUser.id);

        expect(usersService.findOneForAuth).toHaveBeenCalledWith(mockUser.id);
      });

      it('should generate new token', async () => {
        await service.execute(mockUser.id);

        expect(tokenService.generateToken).toHaveBeenCalledWith({
          userId: mockUser.id,
          username: mockUser.username,
          roles: ['staf'],
        });
      });

      it('should emit token refreshed event', async () => {
        await service.execute(mockUser.id);

        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'token.refreshed',
          expect.objectContaining({
            userId: mockUser.id,
            username: mockUser.username,
          }),
        );
      });

      it('should return new access token', async () => {
        const result = await service.execute(mockUser.id);

        expect(result).toHaveProperty('access_token');
        expect(result.access_token).toBe(mockAccessToken);
      });
    });

    describe('User Not Found', () => {
      beforeEach(() => {
        usersService.findOneForAuth.mockResolvedValue(null);
      });

      it('should throw error when user not found', async () => {
        await expect(service.execute(999)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.execute(999)).rejects.toThrow(
          'User tidak ditemukan',
        );
      });

      it('should not generate token when user not found', async () => {
        await expect(service.execute(999)).rejects.toThrow();

        expect(tokenService.generateToken).not.toHaveBeenCalled();
      });

      it('should not emit event when user not found', async () => {
        await expect(service.execute(999)).rejects.toThrow();

        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });
    });

    describe('Token Generation Failure', () => {
      beforeEach(() => {
        usersService.findOneForAuth.mockResolvedValue(mockUser as any);
      });

      it('should throw error when token generation fails', async () => {
        tokenService.generateToken.mockImplementation(() => {
          throw new Error('Token generation failed');
        });

        await expect(service.execute(mockUser.id)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.execute(mockUser.id)).rejects.toThrow(
          'Gagal refresh token',
        );
      });

      it('should not emit event when token generation fails', async () => {
        tokenService.generateToken.mockImplementation(() => {
          throw new Error('Token generation failed');
        });

        await expect(service.execute(mockUser.id)).rejects.toThrow();

        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });
    });

    describe('User with Multiple Roles', () => {
      it('should handle user with multiple roles', async () => {
        const userWithMultipleRoles = {
          ...mockUser,
          roles: [
            { id: 1, name: UserRole.STAF, description: 'Admin' },
            { id: 2, name: UserRole.DOKTER, description: 'Dokter' },
          ],
        } as User;

        usersService.findOneForAuth.mockResolvedValue(userWithMultipleRoles as any);
        tokenService.generateToken.mockReturnValue(mockAccessToken);

        await service.execute(userWithMultipleRoles.id);

        expect(tokenService.generateToken).toHaveBeenCalledWith({
          userId: userWithMultipleRoles.id,
          username: userWithMultipleRoles.username,
          roles: ['staf', 'dokter'],
        });
      });

      it('should handle user with no roles', async () => {
        const userWithNoRoles = {
          ...mockUser,
          roles: [],
        } as User;

        usersService.findOneForAuth.mockResolvedValue(userWithNoRoles as any);
        tokenService.generateToken.mockReturnValue(mockAccessToken);

        await service.execute(userWithNoRoles.id);

        expect(tokenService.generateToken).toHaveBeenCalledWith({
          userId: userWithNoRoles.id,
          username: userWithNoRoles.username,
          roles: [],
        });
      });
    });

    describe('Edge Cases', () => {
      beforeEach(() => {
        usersService.findOneForAuth.mockResolvedValue(mockUser as any);
        tokenService.generateToken.mockReturnValue(mockAccessToken);
      });

      it('should handle userId of 0', async () => {
        const result = await service.execute(0);

        expect(result).toBeDefined();
        expect(usersService.findOneForAuth).toHaveBeenCalledWith(0);
      });

      it('should handle negative userId', async () => {
        await expect(service.execute(-1)).resolves.toBeDefined();
      });

      it('should handle very large userId', async () => {
        const largeUserId = Number.MAX_SAFE_INTEGER;
        const result = await service.execute(largeUserId);

        expect(result).toBeDefined();
        expect(usersService.findOneForAuth).toHaveBeenCalledWith(largeUserId);
      });
    });

    describe('Database Errors', () => {
      it('should handle database connection errors', async () => {
        usersService.findOneForAuth.mockRejectedValue(
          new Error('Database connection failed'),
        );

        await expect(service.execute(mockUser.id)).rejects.toThrow(
          UnauthorizedException,
        );
      });

      it('should handle unexpected errors', async () => {
        usersService.findOneForAuth.mockRejectedValue(
          new Error('Unexpected error'),
        );

        await expect(service.execute(mockUser.id)).rejects.toThrow();
      });
    });
  });
});