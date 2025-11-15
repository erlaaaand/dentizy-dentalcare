import { 
    IsNotEmpty, 
    IsNumber, 
    IsOptional, 
    IsString,
    MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMedicalRecordDto {
    @IsNotEmpty({ message: 'Appointment ID harus diisi' })
    @IsNumber()
    appointment_id: number;

    @IsNotEmpty({ message: 'User ID staff harus diisi' })
    @IsNumber()
    user_id_staff: number;

    @IsOptional()
    @IsString()
    @MaxLength(5000, { message: 'Subjektif maksimal 5000 karakter' })
    @Transform(({ value }) => value?.trim())
    subjektif?: string;

    @IsOptional()
    @IsString()
    @MaxLength(5000, { message: 'Objektif maksimal 5000 karakter' })
    @Transform(({ value }) => value?.trim())
    objektif?: string;

    @IsOptional()
    @IsString()
    @MaxLength(5000, { message: 'Assessment maksimal 5000 karakter' })
    @Transform(({ value }) => value?.trim())
    assessment?: string;

    @IsOptional()
    @IsString()
    @MaxLength(5000, { message: 'Plan maksimal 5000 karakter' })
    @Transform(({ value }) => value?.trim())
    plan?: string;
}