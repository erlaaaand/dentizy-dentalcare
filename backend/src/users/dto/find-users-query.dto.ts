import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../roles/entities/role.entity';

export class FindUsersQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}