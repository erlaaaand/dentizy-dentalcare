// application/orchestrator/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LoginService } from '../use-cases/login.service';
import { TokenVerificationService } from '../use-cases/token-verification.service';
import { TokenRefreshService } from '../use-cases/token-refresh.service';
import { LogoutService } from '../use-cases/logout.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let loginService: jest.Mocked<LoginService>;
  let tokenVerificationService: jest.Mocked<TokenVerificationService>;
  let tokenRefreshService: jest.Mocked<TokenRefreshService>;
  let logoutService: jest.Mocked<LogoutService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: LoginService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: TokenVerificationService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: TokenRefreshService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: LogoutService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    loginService = module.get(LoginService);
    tokenVerificationService = module.get(TokenVerificationService);
    tokenRefreshService = module.get(TokenRefreshService);
    logoutService = module.get(LogoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };
      const expectedResult = {
        access_token: 'token123',
        user: {
          id: 1,
          username: 'testuser',
          nama_lengkap: 'Test User',
          roles: ['staf'],
        },
      };

      loginService.execute.mockResolvedValue(expectedResult);

      const result = await service.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(loginService.execute).toHaveBeenCalledWith(loginDto, undefined);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { username: 'testuser', password: 'wrongpassword' };

      loginService.execute.mockRejectedValue(
        new UnauthorizedException('Username atau password salah'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const token = 'valid.jwt.token';
      const expectedResult = {
        valid: true,
        userId: 1,
        username: 'testuser',
        roles: ['staf'],
      };

      tokenVerificationService.execute.mockResolvedValue(expectedResult);

      const result = await service.verifyToken(token);

      expect(result).toEqual(expectedResult);
      expect(tokenVerificationService.execute).toHaveBeenCalledWith(token);
    });

    it('should return invalid for expired token', async () => {
      const token = 'expired.jwt.token';
      const expectedResult = {
        valid: false,
        message: 'Token tidak valid atau sudah kadaluarsa',
      };

      tokenVerificationService.execute.mockResolvedValue(expectedResult);

      const result = await service.verifyToken(token);

      expect(result.valid).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const userId = 1;
      const expectedResult = { access_token: 'new.token.here' };

      tokenRefreshService.execute.mockResolvedValue(expectedResult);

      const result = await service.refreshToken(userId);

      expect(result).toEqual(expectedResult);
      expect(tokenRefreshService.execute).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const userId = 999;

      tokenRefreshService.execute.mockRejectedValue(
        new UnauthorizedException('User tidak ditemukan'),
      );

      await expect(service.refreshToken(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const userId = 1;
      const expectedResult = { message: 'Logout berhasil' };

      logoutService.execute.mockResolvedValue(expectedResult);

      const result = await service.logout(userId);

      expect(result).toEqual(expectedResult);
      expect(logoutService.execute).toHaveBeenCalledWith(userId);
    });
  });
});