import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({
        required: false,
        description: 'Nama lengkap pengguna',
        example: 'Adi Saputra'
    })
    @IsOptional()
    @IsString({ message: 'Nama lengkap harus berupa teks' })
    nama_lengkap?: string;

    @ApiProperty({
        required: false,
        description: 'Username baru untuk login',
        example: 'adi.saputra'
    })
    @IsOptional()
    @IsString({ message: 'Username harus berupa teks' })
    username?: string;

    @ApiProperty({
        required: false,
        description: 'Daftar ID role pengguna',
        example: [1, 2],
        type: [Number]
    })
    @IsOptional()
    @IsArray({ message: 'Roles harus berupa array' })
    @IsNumber({}, { each: true, message: 'Setiap role harus berupa angka (ID)' })
    roles?: number[];
}
