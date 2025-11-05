import { IsArray, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
import { IsStrongPassword, PASSWORD_MIN_LENGTH } from '../../shared/validators/password.validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    nama_lengkap: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH, { message: `Password minimal ${PASSWORD_MIN_LENGTH} karakter` })
    @IsStrongPassword() // ✅ Using centralized validator
    password: string;

    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    roles: number[]; // Array berisi ID role, contoh: [1] untuk 'dokter'
}