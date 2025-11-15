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
    BadRequestException,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { UsersService } from '../../applications/orchestrator/users.service';
import { CreateUserDto } from '../../applications/dto/create-user.dto';
import { UpdateUserDto } from '../../applications/dto/update-user.dto';
import { ChangePasswordDto } from '../../applications/dto/change-password.dto';
import { ResetPasswordDto } from '../../applications/dto/reset-password.dto';
import { FindUsersQueryDto } from '../../applications/dto/find-users-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../auth/interface/guards/roles.guard';
import { Roles } from '../../../auth/interface/decorators/roles.decorator';
import { GetUser } from '../../../auth/interface/decorators/get-user.decorator';
import { UserRole } from '../../../roles/entities/role.entity';
import { User } from '../../domains/entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * Create new user (Staf & Kepala Klinik only)
     */
    @Post()
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.CREATED)
    create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    /**
     * Get all users with optional role filter
     */
    @Get()
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK)
    findAll(@Query(ValidationPipe) query: FindUsersQueryDto) {
        return this.usersService.findAll(query);
    }

    /**
     * Get user by ID
     */
    @Get(':id')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    /**
     * Update user
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
     * Delete user
     */
    @Delete(':id')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.OK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    /**
     * Change password (authenticated user changes their own password)
     */
    @Post('change-password')
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @GetUser() user: User,
        @Body(ValidationPipe) changePasswordDto: ChangePasswordDto
    ) {
        // Validate password confirmation
        if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
            throw new BadRequestException(
                'Password baru dan konfirmasi password tidak sama'
            );
        }

        return this.usersService.changePassword(
            user.id,
            changePasswordDto.oldPassword,
            changePasswordDto.newPassword
        );
    }

    /**
     * Reset user password (admin only)
     */
    @Post(':id/reset-password')
    @Roles(UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto
    ) {
        return this.usersService.resetPassword(id, resetPasswordDto.newPassword);
    }

    /**
     * Generate temporary password (admin only)
     */
    @Post(':id/generate-temp-password')
    @Roles(UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.OK)
    async generateTempPassword(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.generateTemporaryPassword(id);
    }

    /**
 * Search users by name
 */
    @Get('search')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    async searchUsers(@Query('q') searchTerm: string) {
        return this.usersService.searchByName(searchTerm);
    }

    /**
     * Check username availability
     */
    @Get('check-username/:username')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    async checkUsername(@Param('username') username: string) {
        return this.usersService.checkUsernameAvailability(username);
    }

    /**
     * Get user statistics
     */
    @Get('statistics')
    @Roles(UserRole.KEPALA_KLINIK)
    async getStatistics() {
        return this.usersService.getUserStatistics();
    }

    /**
     * Get recently created users
     */
    @Get('recent')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    async getRecentUsers(@Query('limit', ParseIntPipe) limit: number = 10) {
        return this.usersService.getRecentlyCreated(limit);
    }
}