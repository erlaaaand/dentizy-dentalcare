export class UserResponseDto {
    id: number;
    username: string;
    nama_lengkap: string;
    roles: {
        id: number;
        name: string;
        description: string;
    }[];
    created_at: Date;
    updated_at: Date;
    profile_photo?: string;
}