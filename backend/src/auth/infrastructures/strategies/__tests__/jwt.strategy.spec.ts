import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../jwt.strategy';
import { UsersService } from '../../../../users/applications/orchestrator/users.service';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

const mockUser: User = {
  id: 1,
  username: 'testuser',
  nama_lengkap: 'Test User',
  password: '$2b$10$hashedPassword',
  roles: [{ id: 1, name: UserRole.STAF, description: 'Staf' }],
} as User;

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: {
            findOneForAuth: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    describe('Successful Validation', () => {
      beforeEach(() => {
        usersService.findOneForAuth.mockResolvedValue(mockUser);
      });

      it('should validate and return user for valid payload', async () => {
        const payload = { sub: 1, username: 'testuser' };

        const result = await strategy.validate(payload);

        expect(result).toEqual(mockUser);
      });

      it('should call findOneForAuth with correct userId', async () => {
        const payload = { sub: 1, username: 'testuser' };

        await strategy.validate(payload);

        expect(usersService.findOneForAuth).toHaveBeenCalledWith(1);
      });

      it('should return full user entity', async () => {
        const payload = { sub: 1, username: 'testuser' };

        const result = await strategy.validate(payload);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('username');
        expect(result).toHaveProperty('roles');
      });

      it('should handle different userId', async () => {
        const payload = { sub: 123, username: 'otheruser' };
        const otherUser = { ...mockUser, id: 123, username: 'otheruser' } as User;
        usersService.findOneForAuth.mockResolvedValue(otherUser);

        const result = await strategy.validate(payload);

        expect(result.id).toBe(123);
        expect(result.username).toBe('otheruser');
      });
    });

    describe('User Not Found', () => {
      beforeEach(() => {
        usersService.findOneForAuth.mockResolvedValue(null);
      });

      it('should throw UnauthorizedException when user not found', async () => {
        const payload = { sub: 999, username: 'nonexistent' };

        await expect(strategy.validate(payload)).rejects.toThrow(
          UnauthorizedException,
        );
      });

      it('should throw with correct error message', async () => {
        const payload = { sub: 999, username: 'nonexistent' };

        await expect(strategy.validate(payload)).rejects.toThrow(
          'Token tidak valid atau pengguna tidak ditemukan.',
        );
      });

      it('should not return user when not found', async () => {
        const payload = { sub: 999, username: 'nonexistent' };

        await expect(strategy.validate(payload)).rejects.toThrow();
        expect(usersService.findOneForAuth).toHaveBeenCalledWith(999);
      });
    });

    describe('Edge Cases', () => {
      it('should handle userId of 0', async () => {
        const payload = { sub: 0, username: 'user' };
        const user = { ...mockUser, id: 0 } as User;
        usersService.findOneForAuth.mockResolvedValue(user);

        const result = await strategy.validate(payload);

        expect(result.id).toBe(0);
      });

      it('should handle negative userId', async () => {
        const payload = { sub: -1, username: 'user' };
        usersService.findOneForAuth.mockResolvedValue(null);

        await expect(strategy.validate(payload)).rejects.toThrow();
      });

      it('should handle empty username', async () => {
        const payload = { sub: 1, username: '' };
        const user = { ...mockUser, username: '' } as User;
        usersService.findOneForAuth.mockResolvedValue(user);

        const result = await strategy.validate(payload);

        expect(result.username).toBe('');
      });

      it('should handle very long username', async () => {
        const longUsername = 'a'.repeat(1000);
        const payload = { sub: 1, username: longUsername };
        const user = { ...mockUser, username: longUsername } as User;
        usersService.findOneForAuth.mockResolvedValue(user);

        const result = await strategy.validate(payload);

        expect(result.username).toBe(longUsername);
      });
    });

    describe('Database Errors', () => {
      it('should handle database connection error', async () => {
        const payload = { sub: 1, username: 'testuser' };
        usersService.findOneForAuth.mockRejectedValue(
          new Error('Database connection failed'),
        );

        await expect(strategy.validate(payload)).rejects.toThrow();
      });

      it('should handle query timeout', async () => {
        const payload = { sub: 1, username: 'testuser' };
        usersService.findOneForAuth.mockRejectedValue(
          new Error('Query timeout'),
        );

        await expect(strategy.validate(payload)).rejects.toThrow();
      });
    });
  });

  describe('Configuration', () => {
    it('should use JWT_SECRET from config', () => {
      expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
    });
  });
});