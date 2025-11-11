import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ValidationPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../roles/entities/role.entity';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientDto } from './dto/search-patient.dto';

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    /**
     *  FIX: Hanya STAF dan KEPALA_KLINIK yang bisa create patient
     */
    @Post()
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    create(@Body(ValidationPipe) createPatientDto: CreatePatientDto) {
        return this.patientsService.create(createPatientDto);
    }

    /**
     * FIX: Semua role authenticated bisa lihat daftar pasien
     * Tapi dengan pagination untuk performance
     */
    @Get()
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK)
    findAll(@Query(ValidationPipe) query: SearchPatientDto) {
        return this.patientsService.findAll(query);
    }

    /**
     * FIX: Search endpoint dengan proper validation
     */
    @Get('search')
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK)
    search(@Query(ValidationPipe) query: SearchPatientDto) {
        return this.patientsService.search(query);
    }

    /**
     * FIX: Get by medical record number
     */
    @Get('by-medical-record/:number')
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK)
    findByMedicalRecordNumber(@Param('number') number: string) {
        return this.patientsService.findByMedicalRecordNumber(number);
    }

    /**
     * FIX: Get patients by doctor ID
     */
    @Get('by-doctor/:doctorId')
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK)
    findByDoctor(@Param('doctorId', ParseIntPipe) doctorId: number, @Query(ValidationPipe) query: SearchPatientDto) {
        return this.patientsService.findByDoctor(doctorId, query);
    }

    /**
     * FIX: Get by NIK
     */
    @Get('by-nik/:nik')
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK)
    findByNik(@Param('nik') nik: string) {
        return this.patientsService.findByNik(nik);
    }

    /**
     * FIX: Get by ID dengan role guard
     */
    @Get(':id')
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.findOne(id);
    }

    /**
     * FIX: Hanya STAF dan KEPALA_KLINIK yang bisa update
     */
    @Patch(':id')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updatePatientDto: UpdatePatientDto
    ) {
        return this.patientsService.update(id, updatePatientDto);
    }

    /**
     * FIX: Hanya KEPALA_KLINIK yang bisa delete (hard delete berbahaya)
     */
    @Delete(':id')
    @Roles(UserRole.KEPALA_KLINIK)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.remove(id);
    }
}