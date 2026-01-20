import { UserResponseDto } from '../api/model';

/**
 * Menggunakan UserResponseDto sebagai base, tapi kita bisa extend
 * jika frontend butuh properti tambahan (misal: computed properties)
 */
export type AuthUser = UserResponseDto;

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}