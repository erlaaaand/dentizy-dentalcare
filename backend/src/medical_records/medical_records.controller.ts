import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { MedicalRecordsService } from './medical_records.service';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../roles/entities/role.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('medical-records')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MedicalRecordsController {
    constructor(private readonly medicalRecordsService: MedicalRecordsService) { }

    @Post()
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    create(
        @Body(ValidationPipe) createMedicalRecordDto: CreateMedicalRecordDto,
        @GetUser() user: User,
    ) {
        return this.medicalRecordsService.create(createMedicalRecordDto, user);
    }

    @Get()
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    findAll(@GetUser() user: User) {
        return this.medicalRecordsService.findAll(user);
    }

    @Get('by-appointment/:appointmentId')
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    findByAppointmentId(@Param('appointmentId', ParseIntPipe) appointmentId: number) {
        return this.medicalRecordsService.findByAppointmentId(appointmentId);
    }

    @Get(':id')
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.medicalRecordsService.findOne(id, user);
    }

    @Patch(':id')
    @Roles(UserRole.DOKTER, UserRole.STAF, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateMedicalRecordDto: UpdateMedicalRecordDto,
        @GetUser() user: User,
    ) {
        return this.medicalRecordsService.update(id, updateMedicalRecordDto, user);
    }

    @Delete(':id')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK (punya hak hapus juga)
    remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.medicalRecordsService.remove(id, user);
    }
}