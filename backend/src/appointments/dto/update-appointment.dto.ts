import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class UpdateAppointmentDto {
    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    // Anda bisa tambahkan properti lain yang boleh diubah
    @IsOptional()
    @IsString()
    keluhan?: string;
}