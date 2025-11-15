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
  ValidationPipe
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/interface/guards/roles.guard';
import { Roles } from '../auth/interface/decorators/roles.decorator';
import { UserRole } from './entities/role.entity';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), RolesGuard) // ✅ KRITIS: Protect roles endpoint
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @Roles(UserRole.KEPALA_KLINIK) // Hanya kepala klinik yang bisa buat role baru
    create(@Body(ValidationPipe) createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK) // Staf perlu lihat roles untuk assign ke user
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.KEPALA_KLINIK)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.KEPALA_KLINIK)
    update(
        @Param('id', ParseIntPipe) id: number, 
        @Body(ValidationPipe) updateRoleDto: UpdateRoleDto
    ) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @Roles(UserRole.KEPALA_KLINIK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.remove(id);
    }
}