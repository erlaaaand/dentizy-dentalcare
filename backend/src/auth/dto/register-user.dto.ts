import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../roles/entities/role.entity';

export class RegisterUserDto {
    @IsNotEmpty()
    @IsString()
    nama_lengkap: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password minimal 8 karakter' })
    password: string;

    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    roles: number[]; // Array berisi ID role, contoh: [2] untuk 'staf'
}