import type { UserResponseDto } from '../../../../types/auth/auth.types';
import { authTokenManager } from './token.manager';

export class AuthHelpers {

  isAuthenticated(): boolean {
    return !!authTokenManager.getTokenFromCookie();
  }

  formatUserRole(user: UserResponseDto): string {
    return user.role || 'User';
  }

  getUserInitials(user: UserResponseDto): string {
    const name = user.nama_lengkap || user.username;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}

export const authHelpers = new AuthHelpers();