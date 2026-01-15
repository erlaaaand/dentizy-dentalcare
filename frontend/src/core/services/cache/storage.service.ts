// frontend/src/core/services/storage/storage.service.ts

import { AUTH_CONFIG } from '@/core/config/auth.config';
import type { AuthUser } from '@/core/types/auth-user.types';

class StorageService {
  private safeParse<T>(value: string | null): T | null {
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  // ========= TOKEN =========
  setAccessToken(token: string): void {
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }

  removeAccessToken(): void {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }

  removeRefreshToken(): void {
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }

  // ========= USER =========
  setUser(user: AuthUser): void {
    if (!user) {
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      return;
    }
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
  }

  getUser(): AuthUser | null {
    return this.safeParse<AuthUser>(
      localStorage.getItem(AUTH_CONFIG.USER_KEY)
    );
  }

  removeUser(): void {
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
  }

  // ========= SESSION =========
  setSessionStart(): void {
    localStorage.setItem('session_start', Date.now().toString());
  }

  getSessionStart(): number | null {
    const value = localStorage.getItem('session_start');
    return value ? Number(value) : null;
  }

  clearSession(): void {
    localStorage.removeItem('session_start');
  }

  // ========= CLEAR AUTH ONLY =========
  clearAuth(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeUser();
  }

  // ========= CLEAR ALL =========
  clearAll(): void {
    this.clearAuth();
    this.clearSession();
  }
}

export const storageService = new StorageService();

// OPTIONAL (jika ingin sessionStorage juga)
export const sessionStorageService = {
  set(key: string, value: unknown) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  get<T>(key: string) {
    const raw = sessionStorage.getItem(key);
    try {
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  remove(key: string) {
    sessionStorage.removeItem(key);
  },
  clear() {
    sessionStorage.clear();
  }
};
