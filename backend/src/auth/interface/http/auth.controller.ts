import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Req,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from '../../applications/orchestrator/auth.service';
import { LoginDto } from '../../applications/dto/login.dto';
import { VerifyTokenDto } from '../../applications/dto/verify-token.dto';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../../../users/domains/entities/user.entity';
import type { Request } from 'express';

import { UsersService } from '../../../users/applications/orchestrator/users.service';
import { UpdateProfileDto } from '../../applications/dto/update-profile.dto'; // Buat file DTO ini
import { UserResponseDto } from '../../../users/applications/dto/user-response.dto';
import { TokenService } from '../../domains/services/token.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @UseGuards(ThrottlerGuard) // : Rate limiting untuk login
  @HttpCode(HttpStatus.OK) // : Login sukses mengembalikan 200
  @ApiOperation({
    summary: 'Login pengguna',
    description: 'Autentikasi via email/password dan dapatkan token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil, mengembalikan token',
    schema: {
      example: {
        access_token: 'jwt.access.token',
        refresh_token: 'jwt.refresh.token',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  @ApiResponse({ status: 400, description: 'Data tidak valid' })
  @ApiResponse({ status: 429, description: 'Terlalu banyak percobaan login' }) // Untuk Throttler
  async login(@Body(ValidationPipe) loginDto: LoginDto, @Req() req: Request) {
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };

    return this.authService.login(loginDto, metadata);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token') // : Menandakan endpoint ini butuh token
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token berhasil diperbarui',
    schema: {
      example: {
        access_token: 'new.jwt.access.token',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token tidak valid' })
  async refresh(@GetUser() user: User) {
    // Asumsi 'user' dari 'jwt' strategy (setelah validasi refresh token)
    // Jika 'user' berisi data dari access token, Anda mungkin perlu service terpisah
    return this.authService.refreshToken(user.id);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifikasi validitas token' })
  @ApiResponse({ status: 200, description: 'Token valid', type: User })
  @ApiResponse({ status: 401, description: 'Token tidak valid' })
  async verify(@Body(ValidationPipe) verifyTokenDto: VerifyTokenDto) {
    return this.authService.verifyToken(verifyTokenDto.token);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token') //
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout pengguna' })
  @ApiResponse({
    status: 200,
    description: 'Logout berhasil',
    schema: {
      example: { message: 'Logout berhasil' },
    },
  })
  @ApiResponse({ status: 401, description: 'Token tidak valid' })
  async logout(@GetUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token') //
  @ApiOperation({ summary: 'Dapatkan profil pengguna saat ini' })
  @ApiResponse({
    status: 200,
    description: 'Profil pengguna',
    type: User, // Catatan: Ini akan menampilkan semua properti User di Swagger
    // Sebaiknya gunakan UserResponseDto jika ada
  })
  @ApiResponse({ status: 401, description: 'Token tidak valid' })
  async getProfile(@GetUser() user: User) {
    // Logika ini sudah bagus untuk membuang password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update profil pengguna saat ini' })
  @ApiResponse({
    status: 200,
    description: 'Profil berhasil diupdate, mengembalikan token baru',
    schema: {
      // Contoh skema respons gabungan
      example: {
        id: 1,
        username: 'erland_baru',
        nama_lengkap: 'Erland Agsya Agustian',
        roles: [{ id: 1, name: 'dokter' }],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        profile_photo: null,
        access_token: 'jwt.baru.yang.telah.diperbarui',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token tidak valid' })
  @ApiResponse({ status: 409, description: 'Username sudah digunakan' })
  async updateMyProfile(
    @GetUser() user: User, // Dapatkan user yang sedang login
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto, // Gunakan DTO baru yang aman
  ): Promise<UserResponseDto & { access_token: string }> {
    // Panggil service update yang sudah ada
    // 'updateProfileDto' tidak berisi 'roles', jadi aman
    const updatedUserDto = await this.usersService.update(
      user.id,
      updateProfileDto,
    );

    // Buat token baru berdasarkan data yang sudah di-update
    const tokenPayload = {
      userId: updatedUserDto.id,
      username: updatedUserDto.username,
      roles: updatedUserDto.roles.map((role) => role.name), // Ambil roles dari DTO respons
    };

    // Asumsi Anda punya method 'generateToken' di AuthService
    const newAccessToken = this.tokenService.generateToken(tokenPayload); // Sesuaikan nama method jika perlu
    // Kembalikan data user baru DAN token baru
    return {
      ...updatedUserDto,
      access_token: newAccessToken,
    };
  }
}
