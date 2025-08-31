import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
    @IsNotEmpty()
    @IsNumber()
    patient_id: number;

    @IsNotEmpty()
    @IsNumber()
    doctor_id: number;

    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    // Anda bisa tambahkan properti lain sesuai kebutuhan
    @IsNotEmpty()
    @IsString()
    tanggal_janji: string; // contoh: "2025-12-25"
}