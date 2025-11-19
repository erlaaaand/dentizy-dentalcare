// users/applications/dto/find-users-query.dto.ts

import { IsEnum, IsOptional, IsNumber, Min, IsString, IsBoolean, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UserRole } from '../../../roles/entities/role.entity';

export class FindUsersQueryDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role tidak valid' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @Type(() => Number) // Mengubah string "1" menjadi number 1
  @IsNumber()
  @Min(1, { message: 'Page minimal 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100, { message: 'Limit maksimal 100' })
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'isActive harus berupa boolean (true/false)' })
  isActive?: boolean;
}