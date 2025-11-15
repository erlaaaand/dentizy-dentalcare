// application/dto/login-response.dto.ts
export class LoginResponseDto {
    access_token: string;
    user: {
        id: number;
        username: string;
        nama_lengkap: string;
        roles: string[];
    };
}