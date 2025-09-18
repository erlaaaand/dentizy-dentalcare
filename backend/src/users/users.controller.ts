import { Controller, Get, Query, ValidationPipe, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../roles/entities/role.entity';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Lindungi semua endpoint di controller ini
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // Endpoint POST /users tidak diubah, tapi kita bisa batasi aksesnya
    @Post()
    @Roles(UserRole.STAF) // Hanya staf yang bisa membuat pengguna baru secara langsung
    create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    // --- PERBAIKAN DI SINI ---
    // Hanya ada SATU method findAll
    @Get()
    @Roles(UserRole.STAF, UserRole.DOKTER) // Hanya staf yang boleh melihat daftar semua pengguna
    findAll(@Query(ValidationPipe) query: FindUsersQueryDto) {
        // Teruskan query ke service. Jika tidak ada query, 'query' akan menjadi objek kosong.
        return this.usersService.findAll(query);
    }

    @Get(':id')
    @Roles(UserRole.STAF) // Hanya staf yang boleh melihat detail pengguna lain
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.STAF) // Hanya staf yang boleh mengupdate pengguna lain
    update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(UserRole.STAF) // Hanya staf yang boleh menghapus pengguna
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}