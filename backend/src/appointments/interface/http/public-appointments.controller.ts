import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PublicBookingService } from '../../applications/use-cases/public-booking.service';
import { PublicBookingDto } from '../../applications/dto/public-booking.dto';
import { AppointmentResponseDto } from '../../applications/dto/appointment-response.dto';

@ApiTags('Public Appointments')
@Controller('public/appointments')
@UseGuards(ThrottlerGuard) // Rate limiting wajib untuk endpoint publik
export class PublicAppointmentsController {
    constructor(private readonly publicBookingService: PublicBookingService) { }

    @Post('book')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Booking janji temu untuk pasien umum (Tanpa Login)',
        description: 'Jika NIK baru, akan membuat data pasien sementara (perlu verifikasi di klinik).'
    })
    @ApiResponse({ status: 201, description: 'Booking berhasil', type: AppointmentResponseDto })
    @ApiResponse({ status: 409, description: 'Konflik jadwal atau data pasien tidak valid' })
    @ApiResponse({ status: 400, description: 'Input tidak valid' })
    async book(@Body() dto: PublicBookingDto) {
        // Return type akan otomatis diserialisasi, idealnya mapping ke DTO response
        return await this.publicBookingService.execute(dto);
    }
}