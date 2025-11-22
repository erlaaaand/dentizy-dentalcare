import { STORAGE_KEYS } from '../../constants/storage.constants';

export class StorageService {
  private storage: Storage;

  constructor(storageType: 'localStorage' | 'sessionStorage' = 'localStorage') {
    this.storage = typeof window !== 'undefined' 
      ? window[storageType] 
      : {} as Storage;
  }

  // Generic Methods
  set(key: string, value: unknown): void {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }

  // Auth Methods
  setAccessToken(token: string): void {
    this.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  getAccessToken(): string | null {
    return this.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  }

  setRefreshToken(token: string): void {
    this.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return this.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setUser(user: unknown): void {
    this.set(STORAGE_KEYS.USER, user);
  }

  getUser<T>(): T | null {
    return this.get<T>(STORAGE_KEYS.USER);
  }

  clearAuth(): void {
    this.remove(STORAGE_KEYS.ACCESS_TOKEN);
    this.remove(STORAGE_KEYS.REFRESH_TOKEN);
    this.remove(STORAGE_KEYS.USER);
  }
}

export const storageService = new StorageService();