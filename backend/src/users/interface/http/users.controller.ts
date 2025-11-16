import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
    Query,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    ClassSerializerInterceptor,
    DefaultValuePipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../auth/interface/guards/roles.guard';
import { Roles } from '../../../auth/interface/decorators/roles.decorator';
import { GetUser } from '../../../auth/interface/decorators/get-user.decorator';
import { UserRole } from '../../../roles/entities/role.entity';
import { UsersService } from '../../applications/orchestrator/users.service';
import { CreateUserDto } from '../../applications/dto/create-user.dto';
import { UpdateUserDto } from '../../applications/dto/update-user.dto';
import { ChangePasswordDto } from '../../applications/dto/change-password.dto';
import { ResetPasswordDto } from '../../applications/dto/reset-password.dto';
import { FindUsersQueryDto } from '../../applications/dto/find-users-query.dto';
import { UserResponseDto } from '../../applications/dto/user-response.dto';
import { PasswordChangeResponseDto } from '../../applications/dto/password-change-response.dto';
import { User } from '../../domains/entities/user.entity';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from '../../../auth/applications/orchestrator/auth.service';
import { BadRequestException } from '@nestjs/common'; // Pastikan ini diimpor

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
    constructor(private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) { }

    @Post()
    @Roles(UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Buat user baru',
        description: 'Hanya STAF dan KEPALA_KLINIK yang dapat membuat user baru'
    })
    @ApiResponse({
        status: 201,
        description: 'User berhasil dibuat',
        type: UserResponseDto
    })
    @ApiResponse({ status: 400, description: 'Data tidak valid' })
    @ApiResponse({ status: 409, description: 'Username sudah terdaftar' })
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK)
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(60) // Cache 60 seconds
    @ApiOperation({ summary: 'Daftar semua user dengan pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'role', required: false, enum: UserRole })
    @ApiResponse({
        status: 200,
        description: 'Daftar user berhasil diambil',
        type: [UserResponseDto]
    })
    async findAll(@Query() query: FindUsersQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get('search')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    @UseGuards(ThrottlerGuard) // Rate limiting untuk search
    @ApiOperation({
        summary: 'Real-time search user',
        description: 'Pencarian dengan multi-field: nama lengkap, username'
    })
    @ApiQuery({ name: 'q', required: true, description: 'Kata kunci pencarian' })
    @ApiResponse({
        status: 200,
        description: 'Hasil pencarian',
        type: [UserResponseDto]
    })
    async search(@Query('q') searchTerm: string) {
        return this.usersService.searchByName(searchTerm);
    }

    @Get('statistics')
    @Roles(UserRole.KEPALA_KLINIK)
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300) // Cache 5 minutes
    @ApiOperation({ summary: 'Statistik user untuk dashboard' })
    @ApiResponse({
        status: 200,
        description: 'Statistik user',
        schema: {
            example: {
                total: 150,
                byRole: {
                    dokter: 20,
                    staf: 100,
                    kepala_klinik: 5
                },
                active: 145,
                inactive: 5
            }
        }
    })
    async getStatistics() {
        return this.usersService.getUserStatistics();
    }

    @Get('recent')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    @ApiOperation({ summary: 'User yang baru dibuat' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maksimal 50' })
    @ApiResponse({
        status: 200,
        description: 'Daftar user terbaru',
        type: [UserResponseDto]
    })
    async getRecentUsers(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10) {
        return this.usersService.getRecentlyCreated(limit);
    }


    @Get('check-username/:username')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    @ApiOperation({ summary: 'Cek ketersediaan username' })
    @ApiParam({ name: 'username', description: 'Username yang akan dicek' })
    @ApiResponse({
        status: 200,
        description: 'Status ketersediaan username',
        schema: {
            example: {
                available: true,
                message: 'Username "john_doe" tersedia'
            }
        }
    })
    async checkUsername(@Param('username') username: string) {
        return this.usersService.checkUsernameAvailability(username);
    }

    @Get(':id')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300)
    @ApiOperation({ summary: 'Detail user by ID' })
    @ApiParam({ name: 'id', description: 'ID User' })
    @ApiResponse({
        status: 200,
        description: 'Detail user dengan relasi',
        type: UserResponseDto
    })
    @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.KEPALA_KLINIK)
    @ApiOperation({
        summary: 'Update data user',
        description: 'Hanya KEPALA_KLINIK yang dapat update'
    })
    @ApiParam({ name: 'id', description: 'ID User' })
    @ApiResponse({
        status: 200,
        description: 'User berhasil diupdate',
        type: UserResponseDto
    })
    @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
    @ApiResponse({ status: 409, description: 'Username sudah digunakan' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<UserResponseDto> {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Hapus user',
        description: 'Hanya KEPALA_KLINIK yang dapat menghapus user'
    })
    @ApiParam({ name: 'id', description: 'ID User' })
    @ApiResponse({
        status: 200,
        description: 'User berhasil dihapus',
        schema: {
            example: { message: 'User john_doe berhasil dihapus' }
        }
    })
    @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        return this.usersService.remove(id);
    }

    @Post('change-password')
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Ganti password sendiri',
        description: 'User yang terautentikasi dapat mengganti password mereka sendiri'
    })
    @ApiResponse({
        status: 200,
        description: 'Password berhasil diubah',
        type: PasswordChangeResponseDto
    })
    @ApiResponse({ status: 400, description: 'Password lama tidak sesuai atau password baru tidak valid' })
    async changePassword(
        @GetUser() user: User,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<PasswordChangeResponseDto> {

        if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
            throw new BadRequestException('Password baru dan konfirmasi password tidak cocok');
        }

        return this.usersService.changePassword(
            user.id,
            changePasswordDto.oldPassword,
            changePasswordDto.newPassword
        );
    }

    @Post(':id/reset-password')
    @Roles(UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Reset password user (admin)',
        description: 'Hanya KEPALA_KLINIK yang dapat mereset password user lain'
    })
    @ApiParam({ name: 'id', description: 'ID User' })
    @ApiResponse({
        status: 200,
        description: 'Password berhasil direset',
        type: PasswordChangeResponseDto
    })
    @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
    async resetPassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() resetPasswordDto: ResetPasswordDto
    ): Promise<PasswordChangeResponseDto> {
        return this.usersService.resetPassword(id, resetPasswordDto.newPassword);
    }

    @Post(':id/generate-temp-password')
    @Roles(UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Generate password temporary',
        description: 'Hanya KEPALA_KLINIK yang dapat generate password temporary untuk user'
    })
    @ApiParam({ name: 'id', description: 'ID User' })
    @ApiResponse({
        status: 200,
        description: 'Password temporary berhasil dibuat',
        schema: {
            example: {
                temporaryPassword: 'Abc123!@#Xyz',
                message: 'Password sementara berhasil dibuat untuk john_doe'
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
    async generateTempPassword(
        @Param('id', ParseIntPipe) id: number
    ): Promise<{ temporaryPassword: string; message: string }> {
        return this.usersService.generateTemporaryPassword(id);
    }
}