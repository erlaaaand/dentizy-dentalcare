// backend/src/payments/interface/http/dto/query-payment.dto.ts
import { IsOptional, IsInt, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MetodePembayaran, StatusPembayaran } from '../../domains/entities/payments.entity';

export class QueryPaymentDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    medicalRecordId?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    patientId?: number;

    @IsOptional()
    @IsEnum(StatusPembayaran)
    statusPembayaran?: StatusPembayaran;

    @IsOptional()
    @IsEnum(MetodePembayaran)
    metodePembayaran?: MetodePembayaran;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}