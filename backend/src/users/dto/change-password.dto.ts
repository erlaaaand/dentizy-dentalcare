import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Password lama harus diisi' })
    @IsString()
    oldPassword: string;

    @IsNotEmpty({ message: 'Password baru harus diisi' })
    @IsString()
    @MinLength(8, { message: 'Password baru minimal 8 karakter' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
        {
            message: 'Password harus mengandung: huruf besar, huruf kecil, angka, dan karakter khusus (@$!%*?&#)'
        }
    )
    newPassword: string;

    @IsNotEmpty({ message: 'Konfirmasi password harus diisi' })
    @IsString()
    confirmPassword: string;
}