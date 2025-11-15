import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    nama_lengkap?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    roles?: number[];
}