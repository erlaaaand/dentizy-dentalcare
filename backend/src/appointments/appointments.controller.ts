import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../roles/entities/role.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Post()
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    create(@Body(ValidationPipe) createAppointmentDto: CreateAppointmentDto) {
        return this.appointmentsService.create(createAppointmentDto);
    }

    @Post(':id/complete')
    @Roles(UserRole.DOKTER, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    complete(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.appointmentsService.complete(id, user);
    }

    @Post(':id/cancel')
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    cancel(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.appointmentsService.cancel(id, user);
    }

    @Get()
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    findAll(
        @GetUser() user: User,
        @Query(ValidationPipe) queryDto: FindAppointmentsQueryDto
    ) {
        return this.appointmentsService.findAll(user, queryDto);
    }

    @Get(':id')
    @Roles(UserRole.STAF, UserRole.DOKTER, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.appointmentsService.findOne(id, user);
    }

    @Patch(':id')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateAppointmentDto: UpdateAppointmentDto
    ) {
        return this.appointmentsService.update(id, updateAppointmentDto);
    }

    @Delete(':id')
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK) // Tambah KEPALA_KLINIK
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.appointmentsService.remove(id);
    }
}