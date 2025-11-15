import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsStrongPassword, PASSWORD_MIN_LENGTH } from '../../../shared/validators/password.validator';

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Password lama harus diisi' })
    @IsString()
    oldPassword: string;

    @IsNotEmpty({ message: 'Password baru harus diisi' })
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH, { message: `Password baru minimal ${PASSWORD_MIN_LENGTH} karakter` })
    @IsStrongPassword() // ✅ Using centralized validator
    newPassword: string;

    @IsNotEmpty({ message: 'Konfirmasi password harus diisi' })
    @IsString()
    confirmPassword: string;
}