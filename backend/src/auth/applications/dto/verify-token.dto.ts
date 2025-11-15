// application/dto/verify-token.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyTokenDto {
    @IsNotEmpty()
    @IsString()
    token: string;
}

export class VerifyTokenResponseDto {
    valid: boolean;
    userId?: number;
    username?: string;
    roles?: string[];
    message?: string;
}