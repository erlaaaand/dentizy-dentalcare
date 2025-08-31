import { Controller, Post, Body, ValidationPipe, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../roles/entities/role.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body(ValidationPipe) loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @UseGuards(AuthGuard('jwt'), RolesGuard) // Lindungi endpoint ini
    @Roles(UserRole.DOKTER) // Hanya user dengan peran DOKTER yang bisa mengakses
    async register(@Body(ValidationPipe) registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }
}