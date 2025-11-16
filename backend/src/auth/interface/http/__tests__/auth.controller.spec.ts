import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../../../applications/orchestrator/auth.service';
import { UsersService } from '../../../../users/applications/orchestrator/users.service';
import { TokenService } from '../../../domains/services/token.service';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';
import { LoginDto } from '../../../applications/dto/login.dto';
import { VerifyTokenDto } from '../../../applications/dto/verify-token.dto';
import { UpdateProfileDto } from '../../../applications/dto/update-profile.dto';
import { UserResponseDto } from '../../../../users/applications/dto/user-response.dto';
import type { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;
  let tokenService: jest.Mocked<TokenService>;

  // ======================
  // MOCK DEPENDENCIES
  // ======================
  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    verifyToken: jest.fn(),
    logout: jest.fn(),
  };

  const mockUsersService = {
    update: jest.fn(),
  };

  const mockTokenService = {
    generateToken: jest.fn(),
  };

  // ======================
  // MOCK DATA
  // ======================
  const mockUser: User = {
    id: 1,
    username: 'erland',
    nama_lengkap: 'Erland Agsya',
    password: 'hashed_password_string', // Penting untuk dites di getProfile
    roles: [{ id: 1, name: UserRole.DOKTER, description: 'Dokter' }],
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: TokenService, useValue: mockTokenService },
        // Mock Guards
        {
          provide: AuthGuard('jwt'),
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: ThrottlerGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    tokenService = module.get(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ------------------------------------
  // TEST CASES UNTUK SETIAP ENDPOINT
  // ------------------------------------

  describe('login', () => {
    it('should call authService.login with DTO and metadata', async () => {
      const loginDto: LoginDto = { username: 'erland', password: '123' };
      const mockReq = {
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('TestAgent'),
      } as unknown as Request;

      const metadata = {
        ipAddress: '127.0.0.1',
        userAgent: 'TestAgent',
      };

      // [PERBAIKAN] Tambahkan properti 'user'
      // Sesuaikan isi mock 'user' ini agar cocok dengan 'UserResponseDto'
      const expectedResult = {
        access_token: 'abc',
        refresh_token: 'xyz',
        user: { // <-- Properti yang hilang
          id: 1,
          username: 'erland',
          nama_lengkap: 'Erland Agsya',
          roles: [{ id: 1, name: UserRole.DOKTER, description: 'Dokter' }]
        }
      };

      // Kita bisa menggunakan 'as any' untuk menyederhanakan mock di tes
      authService.login.mockResolvedValue(expectedResult as any);

      const result = await controller.login(loginDto, mockReq);

      expect(result).toBe(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto, metadata);
      expect(mockReq.get).toHaveBeenCalledWith('user-agent');
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshToken with user ID', async () => {
      const expectedResult = { access_token: 'new_token' };
      authService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refresh(mockUser);

      expect(result).toBe(expectedResult);
      expect(authService.refreshToken).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('verify', () => {
    it('should call authService.verifyToken with the token', async () => {
      const verifyDto: VerifyTokenDto = { token: 'some.token.string' };

      // [PERBAIKAN] Tambahkan properti 'valid'
      const expectedResult = {
        id: 1,
        username: 'erland',
        iat: 12345,
        exp: 123456,
        valid: true // <-- Properti yang hilang
      };

      authService.verifyToken.mockResolvedValue(expectedResult as any);

      const result = await controller.verify(verifyDto);

      expect(result).toBe(expectedResult);
      expect(authService.verifyToken).toHaveBeenCalledWith(verifyDto.token);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with user ID', async () => {
      const expectedResult = { message: 'Logout berhasil' };
      authService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout(mockUser);

      expect(result).toBe(expectedResult);
      expect(authService.logout).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getProfile', () => {
    it('should return the user object without the password', async () => {
      // Ini adalah objek mockUser, TANPA 'password'
      const expectedResult = {
        id: 1,
        username: 'erland',
        nama_lengkap: 'Erland Agsya',
        roles: [{ id: 1, name: UserRole.DOKTER, description: 'Dokter' }],
      };

      const result = await controller.getProfile(mockUser);

      // Memastikan 'password' tidak ada di hasil akhir
      expect(result).not.toHaveProperty('password');
      // Memastikan properti lain sesuai
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateMyProfile', () => {
    it('should update user, generate new token, and return combined result', async () => {
      const updateDto: UpdateProfileDto = { nama_lengkap: 'Erland Updated' };

      // 1. Hasil yang diharapkan dari usersService.update
      const updatedUserDto: UserResponseDto = {
        id: 1,
        username: 'erland',
        nama_lengkap: 'Erland Updated',
        roles: [{ id: 1, name: UserRole.DOKTER, description: 'Dokter' }],
        profile_photo: "http://example.com/photo.jpg",
        created_at: new Date(),
        updated_at: new Date(),
      };

      // 2. Hasil yang diharapkan dari tokenService.generateToken
      const newAccessToken = 'new.jwt.token.string';

      // 3. Mock pemanggilan service
      usersService.update.mockResolvedValue(updatedUserDto);
      tokenService.generateToken.mockReturnValue(newAccessToken);

      // 4. Jalankan method controller
      const result = await controller.updateMyProfile(mockUser, updateDto);

      // 5. Assert
      // Memastikan usersService.update dipanggil dengan benar
      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, updateDto);

      // Memastikan tokenService.generateToken dipanggil dengan payload yang benar
      const expectedTokenPayload = {
        userId: updatedUserDto.id,
        username: updatedUserDto.username,
        roles: updatedUserDto.roles.map(role => role.name),
      };
      expect(tokenService.generateToken).toHaveBeenCalledWith(
        expectedTokenPayload,
      );

      // Memastikan hasil akhirnya adalah gabungan DTO dan token baru
      expect(result).toEqual({
        ...updatedUserDto,
        access_token: newAccessToken,
      });
    });
  });
});