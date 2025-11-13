import { PartialType, OmitType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';
import { IsOptional } from 'class-validator';

export class UpdatePatientDto extends PartialType(
    OmitType(CreatePatientDto, [] as const)
) {
    @ApiPropertyOptional()
    @IsOptional()
    is_active?: boolean;
}