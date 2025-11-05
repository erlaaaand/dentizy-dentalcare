import { Controller, Post, Body, ValidationPipe, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

/**
 * ✅ FIX: Remove register endpoint (use UsersController instead)
 */
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body(ValidationPipe) loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    /**
     * ✅ NEW: Refresh token endpoint
     */
    @Post('refresh')
    @UseGuards(AuthGuard('jwt'))
    async refresh(@GetUser() user: User) {
        return this.authService.refreshToken(user.id);
    }

    /**
     * ✅ NEW: Verify token endpoint
     */
    @Post('verify')
    async verify(@Body('token') token: string) {
        return this.authService.verifyToken(token);
    }
}