export interface AuthUser {
    id: string;
    email: string;
    nama_lengkap?: string;
    roles?: Array<{
        id: string;
        name: string;
        description?: string;
    }>;
}