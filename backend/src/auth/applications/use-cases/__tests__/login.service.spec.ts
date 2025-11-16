// backend/src/auth/applications/use-cases/__tests__/login.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoginService } from '../login.service';
import { UsersService } from '../../../../users/applications/orchestrator/users.service';
import { PasswordHasherService } from '../../../infrastructures/security/password-hasher.service';
import { TimingDefenseService } from '../../../infrastructures/security/timing-defense.service';
import { TokenService } from '../../../domains/services/token.service';
import { SecurityGuardService } from '../../../domains/services/security-guard.service';
import { LoginDto } from '../../dto/login.dto';
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

const mockLoginDto: LoginDto = {
  username: 'testuser',
  password: 'Password123!',
};

const mockMetadata = {
  ipAddress: '127.0.0.1',
  userAgent: 'TestAgent/1.0',
};

const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature';

// ======================
// TEST SUITE
// ======================
describe('LoginService', () => {
  let service: LoginService;
  let usersService: jest.Mocked<UsersService>;
  let passwordHasher: jest.Mocked<PasswordHasherService>;
  let timingDefense: jest.Mocked<TimingDefenseService>;
  let tokenService: jest.Mocked<TokenService>;
  let securityGuard: jest.Mocked<SecurityGuardService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  // ======================
  // SETUP AND TEARDOWN
  // ======================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: UsersService,
          useValue: {
            findOneByUsername: jest.fn(),
          },
        },
        {
          provide: PasswordHasherService,
          useValue: {
            compare: jest.fn(),
            dummyCompare: jest.fn(),
          },
        },
        {
          provide: TimingDefenseService,
          useValue: {
            executeWithProtection: jest.fn((fn) => fn()),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateToken: jest.fn(),
          },
        },
        {
          provide: SecurityGuardService,
          useValue: {
            isAccountLocked: jest.fn(),
            getRemainingLockoutTime: jest.fn(),
            recordFailedAttempt: jest.fn(),
            clearFailedAttempts: jest.fn(),
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

    service = module.get<LoginService>(LoginService);
    usersService = module.get(UsersService);
    passwordHasher = module.get(PasswordHasherService);
    timingDefense = module.get(TimingDefenseService);
    tokenService = module.get(TokenService);
    securityGuard = module.get(SecurityGuardService);
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
    describe('Successful Login', () => {
      beforeEach(() => {
        securityGuard.isAccountLocked.mockReturnValue(false);
        usersService.findOneByUsername.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(true);
        tokenService.generateToken.mockReturnValue(mockAccessToken);
      });

      it('should successfully login user with valid credentials', async () => {
        const result = await service.execute(mockLoginDto, mockMetadata);

        expect(result).toEqual({
          access_token: mockAccessToken,
          user: {
            id: mockUser.id,
            username: mockUser.username,
            nama_lengkap: mockUser.nama_lengkap,
            roles: ['staf'],
          },
        });
      });

      it('should check if account is locked', async () => {
        await service.execute(mockLoginDto, mockMetadata);

        expect(securityGuard.isAccountLocked).toHaveBeenCalledWith(
          mockLoginDto.username,
        );
      });

      it('should find user by username', async () => {
        await service.execute(mockLoginDto, mockMetadata);

        expect(usersService.findOneByUsername).toHaveBeenCalledWith(
          mockLoginDto.username,
        );
      });

      it('should verify password', async () => {
        await service.execute(mockLoginDto, mockMetadata);

        expect(passwordHasher.compare).toHaveBeenCalledWith(
          mockLoginDto.password,
          mockUser.password,
        );
      });

      it('should clear failed attempts on success', async () => {
        await service.execute(mockLoginDto, mockMetadata);

        expect(securityGuard.clearFailedAttempts).toHaveBeenCalledWith(
          mockLoginDto.username,
        );
      });

      it('should generate access token', async () => {
        await service.execute(mockLoginDto, mockMetadata);

        expect(tokenService.generateToken).toHaveBeenCalledWith({
          userId: mockUser.id,
          username: mockUser.username,
          roles: ['staf'],
        });
      });

      it('should emit user logged in event', async () => {
        await service.execute(mockLoginDto, mockMetadata);

        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'user.logged-in',
          expect.objectContaining({
            userId: mockUser.id,
            username: mockUser.username,
            ipAddress: mockMetadata.ipAddress,
            userAgent: mockMetadata.userAgent,
          }),
        );
      });

      it('should work without metadata', async () => {
        const result = await service.execute(mockLoginDto);

        expect(result).toBeDefined();
        expect(result.access_token).toBe(mockAccessToken);
      });

      it('should use timing defense', async () => {
        await service.execute(mockLoginDto, mockMetadata);

        expect(timingDefense.executeWithProtection).toHaveBeenCalled();
      });
    });

    describe('Account Locked', () => {
      it('should throw error when account is locked', async () => {
        securityGuard.isAccountLocked.mockReturnValue(true);
        securityGuard.getRemainingLockoutTime.mockReturnValue(300);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow(UnauthorizedException);
        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow('Akun terkunci. Coba lagi dalam 300 detik.');
      });

      it('should not proceed with login when account is locked', async () => {
        securityGuard.isAccountLocked.mockReturnValue(true);
        securityGuard.getRemainingLockoutTime.mockReturnValue(300);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow();

        expect(usersService.findOneByUsername).not.toHaveBeenCalled();
        expect(passwordHasher.compare).not.toHaveBeenCalled();
      });
    });

    describe('Invalid Credentials', () => {
      beforeEach(() => {
        securityGuard.isAccountLocked.mockReturnValue(false);
      });

      it('should throw error when user not found', async () => {
        usersService.findOneByUsername.mockResolvedValue(null);
        passwordHasher.dummyCompare.mockResolvedValue(false);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow(UnauthorizedException);
        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow('Username atau password salah');
      });

      it('should record failed attempt when user not found', async () => {
        usersService.findOneByUsername.mockResolvedValue(null);
        passwordHasher.dummyCompare.mockResolvedValue(false);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow();

        expect(securityGuard.recordFailedAttempt).toHaveBeenCalledWith(
          mockLoginDto.username,
        );
      });

      it('should use dummy compare when user not found', async () => {
        usersService.findOneByUsername.mockResolvedValue(null);
        passwordHasher.dummyCompare.mockResolvedValue(false);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow();

        expect(passwordHasher.dummyCompare).toHaveBeenCalledWith(
          mockLoginDto.password,
        );
      });

      it('should throw error when password is invalid', async () => {
        usersService.findOneByUsername.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(false);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow(UnauthorizedException);
        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow('Username atau password salah');
      });

      it('should record failed attempt when password is invalid', async () => {
        usersService.findOneByUsername.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(false);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow();

        expect(securityGuard.recordFailedAttempt).toHaveBeenCalledWith(
          mockLoginDto.username,
        );
      });

      it('should not clear failed attempts on invalid credentials', async () => {
        usersService.findOneByUsername.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(false);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow();

        expect(securityGuard.clearFailedAttempts).not.toHaveBeenCalled();
      });

      it('should not generate token on invalid credentials', async () => {
        usersService.findOneByUsername.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(false);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow();

        expect(tokenService.generateToken).not.toHaveBeenCalled();
      });

      it('should not emit event on invalid credentials', async () => {
        usersService.findOneByUsername.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(false);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow();

        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });
    });

    describe('Timing Attack Protection', () => {
      it('should apply timing protection on success', async () => {
        securityGuard.isAccountLocked.mockReturnValue(false);
        usersService.findOneByUsername.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(true);
        tokenService.generateToken.mockReturnValue(mockAccessToken);

        await service.execute(mockLoginDto, mockMetadata);

        expect(timingDefense.executeWithProtection).toHaveBeenCalled();
      });

      it('should apply timing protection on failure', async () => {
        securityGuard.isAccountLocked.mockReturnValue(false);
        usersService.findOneByUsername.mockResolvedValue(null);
        passwordHasher.dummyCompare.mockResolvedValue(false);

        await expect(
          service.execute(mockLoginDto, mockMetadata),
        ).rejects.toThrow();

        expect(timingDefense.executeWithProtection).toHaveBeenCalled();
      });
    });

    describe('User with Multiple Roles', () => {
      it('should handle user with multiple roles', async () => {
        const userWithMultipleRoles = {
          ...mockUser,
          roles: [
            { id: 1, name: UserRole.KEPALA_KLINIK, description: 'Kepala Klinik' },
            { id: 2, name: UserRole.DOKTER, description: 'Dokter' },
            { id: 3, name: UserRole.STAF, description: 'Staf' },
          ],
        } as User;

        securityGuard.isAccountLocked.mockReturnValue(false);
        usersService.findOneByUsername.mockResolvedValue(userWithMultipleRoles);
        passwordHasher.compare.mockResolvedValue(true);
        tokenService.generateToken.mockReturnValue(mockAccessToken);

        const result = await service.execute(mockLoginDto, mockMetadata);

        expect(result.user.roles).toEqual(['kepala_klinik', 'dokter', 'staf']);
      });
    });

    describe('Edge Cases', () => {
      it('should handle user with no roles', async () => {
        const userWithNoRoles = { ...mockUser, roles: [] } as User;

        securityGuard.isAccountLocked.mockReturnValue(false);
        usersService.findOneByUsername.mockResolvedValue(userWithNoRoles);
        passwordHasher.compare.mockResolvedValue(true);
        tokenService.generateToken.mockReturnValue(mockAccessToken);

        const result = await service.execute(mockLoginDto, mockMetadata);

        expect(result.user.roles).toEqual([]);
      });

      it('should handle missing ipAddress in metadata', async () => {
        securityGuard.isAccountLocked.mockReturnValue(false);
        usersService.findOneByUsername.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(true);
        tokenService.generateToken.mockReturnValue(mockAccessToken);

        const metadataWithoutIp = { userAgent: 'TestAgent' };
        const result = await service.execute(mockLoginDto, metadataWithoutIp);

        expect(result).toBeDefined();
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'user.logged-in',
          expect.objectContaining({
            ipAddress: undefined,
          }),
        );
      });

      it('should handle missing userAgent in metadata', async () => {
        securityGuard.isAccountLocked.mockReturnValue(false);
        usersService.findOneByUsername.mockResolvedValue(mockUser);
        passwordHasher.compare.mockResolvedValue(true);
        tokenService.generateToken.mockReturnValue(mockAccessToken);

        const metadataWithoutAgent = { ipAddress: '127.0.0.1' };
        const result = await service.execute(mockLoginDto, metadataWithoutAgent);

        expect(result).toBeDefined();
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'user.logged-in',
          expect.objectContaining({
            userAgent: undefined,
          }),
        );
      });
    });
  });
});