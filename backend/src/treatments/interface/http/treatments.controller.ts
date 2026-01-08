// backend/src/treatments/interface/http/treatments.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

// Pastikan path import guard ini benar
import { RolesGuard } from '../../../auth/interface/guards/roles.guard';
import { Roles } from '../../../auth/interface/decorators/roles.decorator';

// Pastikan UserRole di-import dari entity/enum yang benar dan memiliki value: DOKTER, STAF, KEPALA_KLINIK
import { UserRole } from '../../../roles/entities/role.entity';

import { CreateTreatmentDto } from '../../applications/dto/create-treatment.dto';
import { UpdateTreatmentDto } from '../../applications/dto/update-treatment.dto';
import { QueryTreatmentDto } from '../../applications/dto/query-treatment.dto';
import { TreatmentResponseDto } from '../../applications/dto/treatment-response.dto';
import { PaginatedTreatmentResponseDto } from '../../applications/dto/paginated-treatment-response.dto';

import { CreateTreatmentUseCase } from '../../applications/use-cases/create-treatment.use-case';
import { UpdateTreatmentUseCase } from '../../applications/use-cases/update-treatment.use-case';
import { DeleteTreatmentUseCase } from '../../applications/use-cases/delete-treatment.use-case';
import { RestoreTreatmentUseCase } from '../../applications/use-cases/restore-treatment.use-case';
import { GetTreatmentUseCase } from '../../applications/use-cases/get-treatment.use-case';
import { ListTreatmentsUseCase } from '../../applications/use-cases/list-treatments.use-case';
import { GetTreatmentByCodeUseCase } from 'src/treatments/applications/use-cases/get-treatment-by-code.use-case';

@ApiTags('Treatments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnauthorizedResponse({ description: 'Token tidak valid atau kadaluarsa' })
@ApiForbiddenResponse({
  description: 'Role user tidak memiliki akses ke endpoint ini',
}) // Fix syntax missing '@'
@Controller('treatments')
export class TreatmentsController {
  constructor(
    private readonly createTreatmentUseCase: CreateTreatmentUseCase,
    private readonly updateTreatmentUseCase: UpdateTreatmentUseCase,
    private readonly deleteTreatmentUseCase: DeleteTreatmentUseCase,
    private readonly restoreTreatmentUseCase: RestoreTreatmentUseCase,
    private readonly getTreatmentUseCase: GetTreatmentUseCase,
    private readonly getTreatmentByCodeUseCase: GetTreatmentByCodeUseCase,
    private readonly listTreatmentsUseCase: ListTreatmentsUseCase,
  ) {}

  @Post()
  @Roles(UserRole.KEPALA_KLINIK, UserRole.STAF) // Hanya Admin & Staf
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new treatment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Treatment successfully created',
    type: TreatmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Treatment code already exists',
  })
  async create(
    @Body() createDto: CreateTreatmentDto,
  ): Promise<TreatmentResponseDto> {
    // Return DTO langsung untuk Orval
    return this.createTreatmentUseCase.execute(createDto);
  }

  @Get()
  @Roles(UserRole.KEPALA_KLINIK, UserRole.STAF, UserRole.DOKTER) // Semua role bisa lihat
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all treatments with pagination and filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Treatments successfully retrieved',
    type: PaginatedTreatmentResponseDto,
  })
  async findAll(
    @Query() query: QueryTreatmentDto,
  ): Promise<PaginatedTreatmentResponseDto> {
    return this.listTreatmentsUseCase.execute(query);
  }

  @Get('kode/:kode')
  @Roles(UserRole.KEPALA_KLINIK, UserRole.STAF, UserRole.DOKTER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get treatment by code' })
  @ApiParam({
    name: 'kode',
    description: 'Treatment code',
    example: 'TRT-001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Treatment successfully retrieved',
    type: TreatmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Treatment not found',
  })
  async findByKode(@Param('kode') kode: string) {
    const data = await this.getTreatmentByCodeUseCase.execute(kode);
  }

  @Get(':id')
  @Roles(UserRole.KEPALA_KLINIK, UserRole.STAF, UserRole.DOKTER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get treatment by ID' })
  @ApiParam({
    name: 'id',
    description: 'Treatment ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Treatment successfully retrieved',
    type: TreatmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Treatment not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TreatmentResponseDto> {
    return this.getTreatmentUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(UserRole.KEPALA_KLINIK, UserRole.STAF) // Dokter biasanya tidak bisa edit harga
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update treatment' })
  @ApiParam({
    name: 'id',
    description: 'Treatment ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Treatment successfully updated',
    type: TreatmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Treatment not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Treatment code already exists',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTreatmentDto,
  ): Promise<TreatmentResponseDto> {
    return this.updateTreatmentUseCase.execute(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.KEPALA_KLINIK) // Hanya Kepala Klinik yang boleh hapus
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete treatment' })
  @ApiParam({
    name: 'id',
    description: 'Treatment ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Treatment successfully deleted',
    schema: {
      example: { message: 'Perawatan berhasil dihapus' },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Treatment not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Treatment cannot be deleted',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.deleteTreatmentUseCase.execute(id);
    return { message: 'Perawatan berhasil dihapus' };
  }

  @Patch(':id/restore')
  @Roles(UserRole.KEPALA_KLINIK) // Hanya Kepala Klinik
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft deleted treatment' })
  @ApiParam({
    name: 'id',
    description: 'Treatment ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Treatment successfully restored',
    type: TreatmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Treatment not found',
  })
  async restore(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TreatmentResponseDto> {
    return this.restoreTreatmentUseCase.execute(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.KEPALA_KLINIK, UserRole.STAF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate treatment' })
  @ApiParam({
    name: 'id',
    description: 'Treatment ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Treatment successfully activated',
    type: TreatmentResponseDto,
  })
  async activate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TreatmentResponseDto> {
    return this.updateTreatmentUseCase.execute(id, { isActive: true });
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.KEPALA_KLINIK, UserRole.STAF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate treatment' })
  @ApiParam({
    name: 'id',
    description: 'Treatment ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Treatment successfully deactivated',
    type: TreatmentResponseDto,
  })
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TreatmentResponseDto> {
    return this.updateTreatmentUseCase.execute(id, { isActive: false });
  }
}
