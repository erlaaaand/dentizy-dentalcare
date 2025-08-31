import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entities/role.entity';

export class CreateRoleDto {
    @IsNotEmpty()
    @IsEnum(UserRole)
    name: UserRole;

    @IsOptional()
    @IsString()
    description: string;
}