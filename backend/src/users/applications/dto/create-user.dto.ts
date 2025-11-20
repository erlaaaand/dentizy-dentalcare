import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsString,
    MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsStrongPassword,
    PASSWORD_MIN_LENGTH
} from '../../../shared/validators/password.validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'Nama lengkap pengguna',
        example: 'Dr. Andi Pratama, Sp.A'
    })
    @IsNotEmpty({ message: 'Nama lengkap harus diisi' })
    @IsString()
    nama_lengkap: string;

    @ApiProperty({
        description: 'Username unik untuk login',
        example: 'andi.pratama'
    })
    @IsNotEmpty({ message: 'Username harus diisi' })
    @IsString()
    username: string;

    @ApiProperty({
        description: `Password pengguna, minimal ${PASSWORD_MIN_LENGTH} karakter dan harus strong`,
        example: 'Admin@123'
    })
    @IsNotEmpty({ message: 'Password harus diisi' })
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH, {
        message: `Password minimal ${PASSWORD_MIN_LENGTH} karakter`
    })
    @IsStrongPassword({
        message:
            'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial'
    })
    password: string;

    @ApiProperty({
        description: 'Daftar ID role yang dimiliki user',
        example: [1, 2],
        type: [Number]
    })
    @IsNotEmpty({ message: 'Roles harus diisi' })
    @IsArray({ message: 'Roles harus berupa array' })
    @IsNumber({}, { each: true, message: 'Setiap role harus berupa angka (ID)' })
    roles: number[];
}
