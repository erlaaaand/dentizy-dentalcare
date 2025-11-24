// backend/src/payments/interface/http/dto/create-payment.dto.ts
import { IsInt, IsNumber, IsOptional, IsString, IsEnum, IsDateString, Min } from 'class-validator';
import { MetodePembayaran, StatusPembayaran } from '../../domains/entities/payments.entity';

export class CreatePaymentDto {
    @IsInt()
    medicalRecordId: number;

    @IsInt()
    patientId: number;

    @IsDateString()
    tanggalPembayaran: string;

    @IsNumber()
    @Min(0)
    totalBiaya: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    diskonTotal?: number;

    @IsNumber()
    @Min(0)
    jumlahBayar: number;

    @IsEnum(MetodePembayaran)
    metodePembayaran: MetodePembayaran;

    @IsOptional()
    @IsEnum(StatusPembayaran)
    statusPembayaran?: StatusPembayaran;

    @IsOptional()
    @IsString()
    keterangan?: string;

    @IsOptional()
    @IsInt()
    createdBy?: number;
}
