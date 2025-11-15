import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsStrongPassword, PASSWORD_MIN_LENGTH } from '../../../shared/validators/password.validator';
import { Match } from '../../../shared/validators/match.validator';

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Password lama harus diisi' })
    @IsString()
    oldPassword: string;

    @IsNotEmpty({ message: 'Password baru harus diisi' })
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH, { message: `Password baru minimal ${PASSWORD_MIN_LENGTH} karakter` })
    @IsStrongPassword()
    newPassword: string;

    @IsNotEmpty({ message: 'Konfirmasi password harus diisi' })
    @IsString()
    @Match('newPassword', { message: 'Konfirmasi password tidak sesuai dengan password baru' })
    confirmPassword: string;
}