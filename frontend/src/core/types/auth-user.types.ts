import type { User } from '@/core/api/model';

export interface AuthUser extends User {
    roles?: Array<{ id: number; name: string; description?: string }>;
}
