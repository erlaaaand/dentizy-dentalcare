// TAMBAHAN: Impor decorator dan modul yang dibutuhkan untuk keamanan & query
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto'; // TAMBAHAN
import { AuthGuard } from '@nestjs/passport'; // TAMBAHAN (akan dibuat nanti)
import { RolesGuard } from '../auth/guards/roles.guard'; // TAMBAHAN (akan dibuat nanti)
import { Roles } from '../auth/decorators/roles.decorator'; // TAMBAHAN (akan dibuat nanti)
import { UserRole } from '../roles/entities/role.entity';
import { GetUser } from '../auth/decorators/get-user.decorator'; // TAMBAHAN (akan dibuat nanti)
import { User } from '../users/entities/user.entity';

// TAMBAHAN: Terapkan Guard di level controller
@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Semua endpoint di sini harus login & punya peran
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Post()
    @Roles(UserRole.STAF) // TAMBAHAN: Hanya STAF yang boleh membuat janji temu baru
    create(@Body() createAppointmentDto: CreateAppointmentDto) {
        return this.appointmentsService.create(createAppointmentDto);
    }

    @Post(':id/complete')
    @Roles(UserRole.DOKTER) // TAMBAHAN: Hanya DOKTER yang boleh menyelesaikan
    complete(@Param('id') id: string) {
        return this.appointmentsService.complete(+id);
    }

    @Post(':id/cancel')
    @Roles(UserRole.STAF, UserRole.DOKTER) // TAMBAHAN: Staf dan Dokter boleh membatalkan
    cancel(@Param('id') id: string) {
        return this.appointmentsService.cancel(+id);
    }

    // TAMBAHAN: Method findAll diubah total
    @Get()
    @Roles(UserRole.STAF, UserRole.DOKTER)
    findAll(
        @GetUser() user: User, // Mengambil data user yang sedang login
        @Query() queryDto: FindAppointmentsQueryDto // Mengambil semua query parameter
    ) {
        return this.appointmentsService.findAll(user, queryDto);
    }

    @Get(':id')
    @Roles(UserRole.STAF, UserRole.DOKTER)
    findOne(@Param('id') id: string) {
        return this.appointmentsService.findOne(+id);
    }

    @Patch(':id')
    @Roles(UserRole.STAF)
    update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
        return this.appointmentsService.update(+id, updateAppointmentDto);
    }

    @Delete(':id')
    @Roles(UserRole.STAF)
    remove(@Param('id') id: string) {
        return this.appointmentsService.remove(+id);
    }
}