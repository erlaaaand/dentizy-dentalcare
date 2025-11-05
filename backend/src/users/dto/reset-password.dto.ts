import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Password baru harus diisi' })
    @IsString()
    @MinLength(8, { message: 'Password minimal 8 karakter' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        {
            message: 'Password harus mengandung huruf besar, huruf kecil, dan angka'
        }
    )
    newPassword: string;
}