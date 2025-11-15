import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ValidationPipe,
    ParseIntPipe,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { MedicalRecordsService } from '../../applications/orchestrator/medical_records.service';
import { CreateMedicalRecordDto } from '../../applications/dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../../applications/dto/update-medical-record.dto';
import { SearchMedicalRecordDto } from '../../applications/dto/search-medical-record.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../roles/entities/role.entity';
import { GetUser } from '../../../auth/decorators/get-user.decorator';
import { User } from '../../../users/entities/user.entity';

@Controller('medical-records')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MedicalRecordsController {
    constructor(
        private readonly medicalRecordsService: MedicalRecordsService
    ) { }

    /**
     * Create new medical record
     * POST /medical-records
     */
    @Post()
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body(ValidationPipe) createDto: CreateMedicalRecordDto,
        @GetUser() user: User,
    ) {
        return await this.medicalRecordsService.create(createDto, user);
    }

    /**
     * Get all medical records with optional filters
     * GET /medical-records?page=1&limit=10&patient_id=1&search=flu
     */
    @Get()
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK)
    async findAll(
        @Query(ValidationPipe) filters: SearchMedicalRecordDto,
        @GetUser() user: User
    ) {
        // If any filter is provided, use search method
        const hasFilters = Object.keys(filters).some(key =>
            filters[key] !== undefined && filters[key] !== null
        );

        if (hasFilters) {
            return await this.medicalRecordsService.search(filters, user);
        }

        // Otherwise, return simple list
        const data = await this.medicalRecordsService.findAll(user);
        return {
            data,
            total: data.length,
            page: 1,
            limit: data.length,
        };
    }

    /**
     * Get medical record by appointment ID
     * GET /medical-records/by-appointment/:appointmentId
     */
    @Get('by-appointment/:appointmentId')
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK)
    async findByAppointmentId(
        @Param('appointmentId', ParseIntPipe) appointmentId: number,
        @GetUser() user: User
    ) {
        return await this.medicalRecordsService.findByAppointmentId(appointmentId, user);
    }

    /**
     * Get medical record by ID
     * GET /medical-records/:id
     */
    @Get(':id')
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User
    ) {
        return await this.medicalRecordsService.findOne(id, user);
    }

    /**
     * Update medical record
     * PATCH /medical-records/:id
     */
    @Patch(':id')
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateDto: UpdateMedicalRecordDto,
        @GetUser() user: User,
    ) {
        return await this.medicalRecordsService.update(id, updateDto, user);
    }

    /**
     * Delete medical record (soft delete)
     * DELETE /medical-records/:id
     * Only Kepala Klinik can delete
     */
    @Delete(':id')
    @Roles(UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User
    ) {
        await this.medicalRecordsService.remove(id, user);
    }

    /**
     * Restore soft-deleted medical record
     * POST /medical-records/:id/restore
     * Only Kepala Klinik can restore
     */
    @Post(':id/restore')
    @Roles(UserRole.KEPALA_KLINIK)
    async restore(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User
    ) {
        return await this.medicalRecordsService.restore(id, user);
    }

    /**
     * Hard delete medical record (permanent)
     * DELETE /medical-records/:id/permanent
     * Only Kepala Klinik can permanently delete
     * Use with extreme caution!
     */
    @Delete(':id/permanent')
    @Roles(UserRole.KEPALA_KLINIK)
    @HttpCode(HttpStatus.NO_CONTENT)
    async hardDelete(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User
    ) {
        await this.medicalRecordsService.hardDelete(id, user);
    }
}