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
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/interface/guards/roles.guard';
import { Roles } from '../auth/interface/decorators/roles.decorator';
import { UserRole } from './entities/role.entity';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@Controller('roles')
@UseGuards(AuthGuard('jwt'), RolesGuard) // ✅ KRITIS: Protect roles endpoint
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnauthorizedResponse({ description: 'Token tidak valid atau kadaluarsa' })
@ApiForbiddenResponse({
  description: 'Role user tidak memiliki akses ke endpoint ini',
})
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

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
}
