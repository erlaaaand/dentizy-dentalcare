import { 
    Controller, 
    Get, 
    Query, 
    ValidationPipe, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    UseGuards, 
    ParseIntPipe,
    BadRequestException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../roles/entities/role.entity';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * Buat user baru (Staf & Kepala Klinik)
     */
    @Post()
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    /**
     * Ambil daftar users dengan filter role (opsional)
     */
    @Get()
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK)
    findAll(@Query(ValidationPipe) query: FindUsersQueryDto) {
        return this.usersService.findAll(query);
    }

    /**
     * Ambil user by ID
     */
    @Get(':id')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    /**
     * Update user data
     */
    @Patch(':id')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    update(
        @Param('id', ParseIntPipe) id: number, 
        @Body(ValidationPipe) updateUserDto: UpdateUserDto
    ) {
        return this.usersService.update(id, updateUserDto);
    }

    /**
     * Hapus user
     */
    @Delete(':id')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    /**
     * 🔥 FITUR BARU: Change password (user sendiri)
     * User yang sedang login bisa ubah passwordnya sendiri
     */
    @Post('change-password')
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK) // Semua role
    async changePassword(
        @GetUser() user: User,
        @Body(ValidationPipe) changePasswordDto: ChangePasswordDto
    ) {
        // Validasi: newPassword dan confirmPassword harus sama
        if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
            throw new BadRequestException('Password baru dan konfirmasi password tidak sama');
        }

        await this.usersService.changePassword(
            user.id,
            changePasswordDto.oldPassword,
            changePasswordDto.newPassword
        );

        return {
            message: 'Password berhasil diubah',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 🔥 FITUR BARU: Reset password (admin only)
     * Kepala Klinik bisa reset password user lain
     */
    @Post(':id/reset-password')
    @Roles(UserRole.KEPALA_KLINIK) // Hanya Kepala Klinik
    async resetPassword(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto
    ) {
        await this.usersService.resetPassword(id, resetPasswordDto.newPassword);

        return {
            message: `Password user ID #${id} berhasil direset`,
            timestamp: new Date().toISOString(),
        };
    }
}