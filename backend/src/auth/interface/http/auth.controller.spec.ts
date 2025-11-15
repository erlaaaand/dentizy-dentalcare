// interface/http/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../applications/orchestrator/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            verifyToken: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };
      const mockRequest = {
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
      };
      const expectedResult = {
        access_token: 'token123',
        user: {
          id: 1,
          username: 'testuser',
          nama_lengkap: 'Test User',
          roles: ['staf'],
        },
      };

      authService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto, mockRequest as any);

      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto, {
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { username: 'testuser', password: 'wrongpassword' };
      const mockRequest = {
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
      };

      authService.login.mockRejectedValue(
        new UnauthorizedException('Username atau password salah'),
      );

      await expect(
        controller.login(loginDto, mockRequest as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verify', () => {
    it('should verify valid token', async () => {
      const verifyDto = { token: 'valid.jwt.token' };
      const expectedResult = {
        valid: true,
        userId: 1,
        username: 'testuser',
        roles: ['staf'],
      };

      authService.verifyToken.mockResolvedValue(expectedResult);

      const result = await controller.verify(verifyDto);

      expect(result).toEqual(expectedResult);
      expect(authService.verifyToken).toHaveBeenCalledWith(verifyDto.token);
    });
  });

  describe('refresh', () => {
    it('should refresh token', async () => {
      const mockUser = { id: 1, username: 'testuser' } as any;
      const expectedResult = { access_token: 'new.token.here' };

      authService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refresh(mockUser);

      expect(result).toEqual(expectedResult);
      expect(authService.refreshToken).toHaveBeenCalledWith(1);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const mockUser = { id: 1, username: 'testuser' } as any;
      const expectedResult = { message: 'Logout berhasil' };

      authService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout(mockUser);

      expect(result).toEqual(expectedResult);
      expect(authService.logout).toHaveBeenCalledWith(1);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        nama_lengkap: 'Test User',
        password: 'hashedpassword',
        roles: [],
      } as any;

      const result = await controller.getProfile(mockUser);

      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        nama_lengkap: 'Test User',
        roles: [],
      });
    });
  });
});