export interface AuthUser {
    id: number;
    email: string;
    nama_lengkap?: string;
    roles?: Array<{
        id: number;
        name: string;
        description?: string;
    }>;
}