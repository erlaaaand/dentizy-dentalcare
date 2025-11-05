import { 
    IsEnum, 
    IsOptional, 
    IsString,
    IsDateString,
    Matches,
    MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AppointmentStatus } from '../entities/appointment.entity';

export class UpdateAppointmentDto {
    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    @IsOptional()
    @IsDateString()
    tanggal_janji?: string;

    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    jam_janji?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    @Transform(({ value }) => value?.trim())
    keluhan?: string;
}