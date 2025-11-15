export class PasswordChangeResponseDto {
    message: string;
    timestamp: string;
    user?: {
        id: number;
        username: string;
    };
}