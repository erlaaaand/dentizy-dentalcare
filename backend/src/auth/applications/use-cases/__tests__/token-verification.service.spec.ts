// backend/src/auth/applications/use-cases/__tests__/token-verification.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { TokenVerificationService } from '../token-verification.service';
import { TokenService } from '../../../domains/services/token.service';
import { UsersService } from '../../../../users/applications/orchestrator/users.service';
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

const mockTokenPayload = {
  userId: 1,
  username: 'testuser',
  roles: ['staf'],
};

const mockValidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature';
const mockInvalidToken = 'invalid.token.here';

// ======================
// TEST SUITE
// ======================
describe('TokenVerificationService', () => {
  let service: TokenVerificationService;
  let tokenService: jest.Mocked<TokenService>;
  let usersService: jest.Mocked<UsersService>;

  // ======================
  // SETUP AND TEARDOWN
  // ======================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenVerificationService,
        {
          provide: TokenService,
          useValue: {
            verifyToken: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenVerificationService>(TokenVerificationService);
    tokenService = module.get(TokenService);
    usersService = module.get(UsersService);
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
    describe('Valid Token', () => {
      beforeEach(() => {
        tokenService.verifyToken.mockReturnValue(mockTokenPayload);
        usersService.findOne.mockResolvedValue(mockUser);
      });

      it('should verify token successfully', async () => {
        const result = await service.execute(mockValidToken);

        expect(result).toEqual({
          valid: true,
          userId: mockTokenPayload.userId,
          username: mockTokenPayload.username,
          roles: mockTokenPayload.roles,
        });
      });

      it('should call verifyToken with correct token', async () => {
        await service.execute(mockValidToken);

        expect(tokenService.verifyToken).toHaveBeenCalledWith(mockValidToken);
      });

      it('should check if user exists', async () => {
        await service.execute(mockValidToken);

        expect(usersService.findOne).toHaveBeenCalledWith(
          mockTokenPayload.userId,
        );
      });

      it('should return valid true for valid token', async () => {
        const result = await service.execute(mockValidToken);

        expect(result.valid).toBe(true);
      });

      it('should return user details', async () => {
        const result = await service.execute(mockValidToken);

        expect(result).toHaveProperty('userId', mockTokenPayload.userId);
        expect(result).toHaveProperty('username', mockTokenPayload.username);
        expect(result).toHaveProperty('roles', mockTokenPayload.roles);
      });
    });

    describe('Invalid Token', () => {
      beforeEach(() => {
        tokenService.verifyToken.mockImplementation(() => {
          throw new Error('Invalid token');
        });
      });

      it('should return valid false for invalid token', async () => {
        const result = await service.execute(mockInvalidToken);

        expect(result).toEqual({
          valid: false,
          message: 'Token tidak valid atau sudah kadaluarsa',
        });
      });

      it('should not check user existence for invalid token', async () => {
        await service.execute(mockInvalidToken);

        expect(usersService.findOne).not.toHaveBeenCalled();
      });

      it('should handle malformed token', async () => {
        const result = await service.execute('malformed.token');

        expect(result.valid).toBe(false);
        expect(result).toHaveProperty('message');
      });
    });

    describe('Expired Token', () => {
      beforeEach(() => {
        tokenService.verifyToken.mockImplementation(() => {
          throw new Error('Token expired');
        });
      });

      it('should return valid false for expired token', async () => {
        const result = await service.execute(mockValidToken);

        expect(result).toEqual({
          valid: false,
          message: 'Token tidak valid atau sudah kadaluarsa',
        });
      });

      it('should include error message', async () => {
        const result = await service.execute(mockValidToken);

        expect(result).toHaveProperty('message');
        expect(result.message).toBe('Token tidak valid atau sudah kadaluarsa');
      });
    });

    describe('User Not Found', () => {
      beforeEach(() => {
        tokenService.verifyToken.mockReturnValue(mockTokenPayload);
        usersService.findOne.mockRejectedValue(new NotFoundException('user not found'));
      });

      it('should return valid false when user not found', async () => {
        const result = await service.execute(mockValidToken);
        expect(result.valid).toBe(false);
      });

      it('should throw UnauthorizedException internally', async () => {
        const result = await service.execute(mockValidToken);

        expect(result).toEqual({
          valid: false,
          message: 'Token tidak valid atau sudah kadaluarsa',
        });
      });
    });

    describe('User with Different Roles', () => {
      it('should handle user with multiple roles', async () => {
        const payloadWithMultipleRoles = {
          userId: 1,
          username: 'testuser',
          roles: ['admin', 'dokter', 'staf'],
        };

        tokenService.verifyToken.mockReturnValue(payloadWithMultipleRoles);
        usersService.findOne.mockResolvedValue(mockUser);

        const result = await service.execute(mockValidToken);

        expect(result).toEqual({
          valid: true,
          userId: 1,
          username: 'testuser',
          roles: ['admin', 'dokter', 'staf'],
        });
      });

      it('should handle user with no roles', async () => {
        const payloadWithNoRoles = {
          userId: 1,
          username: 'testuser',
          roles: [],
        };

        tokenService.verifyToken.mockReturnValue(payloadWithNoRoles);
        usersService.findOne.mockResolvedValue(mockUser);

        const result = await service.execute(mockValidToken);

        expect(result.roles).toEqual([]);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty token', async () => {
        tokenService.verifyToken.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        const result = await service.execute('');

        expect(result.valid).toBe(false);
      });

      it('should handle token with special characters', async () => {
        tokenService.verifyToken.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        const result = await service.execute('token@#$%^&*()');

        expect(result.valid).toBe(false);
      });

      it('should handle very long token', async () => {
        const longToken = 'a'.repeat(10000);
        tokenService.verifyToken.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        const result = await service.execute(longToken);

        expect(result.valid).toBe(false);
      });
    });

    describe('Database Errors', () => {
      beforeEach(() => {
        tokenService.verifyToken.mockReturnValue(mockTokenPayload);
      });

      it('should handle database connection errors', async () => {
        usersService.findOne.mockRejectedValue(
          new Error('Database connection failed'),
        );

        const result = await service.execute(mockValidToken);

        expect(result.valid).toBe(false);
        expect(result).toHaveProperty('message');
      });

      it('should handle query timeout errors', async () => {
        usersService.findOne.mockRejectedValue(new Error('Query timeout'));

        const result = await service.execute(mockValidToken);

        expect(result.valid).toBe(false);
      });
    });

    describe('Token Service Errors', () => {
      it('should handle token service throwing UnauthorizedException', async () => {
        tokenService.verifyToken.mockImplementation(() => {
          throw new UnauthorizedException('Unauthorized');
        });

        const result = await service.execute(mockValidToken);

        expect(result.valid).toBe(false);
      });

      it('should handle token service throwing generic Error', async () => {
        tokenService.verifyToken.mockImplementation(() => {
          throw new Error('Token verification failed');
        });

        const result = await service.execute(mockValidToken);

        expect(result.valid).toBe(false);
      });
    });
  });
});