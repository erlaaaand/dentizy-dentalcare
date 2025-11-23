// frontend/src/core/services/cache/storage.service.ts

import {
  LOCAL_STORAGE_KEYS,
  SESSION_STORAGE_KEYS,
  StorageType
} from '@/core/constants/storage.constants';

export class StorageService {
  // Ubah tipe menjadi nullable agar aman saat di Server Side
  private storage: Storage | null;
  private type: StorageType;

  constructor(type: StorageType = StorageType.LOCAL) {
    this.type = type;
    // Cek apakah kode berjalan di Browser (ada window)
    if (typeof window !== 'undefined') {
      this.storage = type === StorageType.LOCAL ? window.localStorage : window.sessionStorage;
    } else {
      // Jika di Server, set null (jangan {} karena akan crash saat dipanggil function-nya)
      this.storage = null;
    }
  }

  // ============================================================================
  // Core Generic Methods (Dengan Pengecekan Null)
  // ============================================================================

  /**
   * Menyimpan data ke storage (otomatis stringify)
   */
  set(key: string, value: unknown): void {
    if (!this.storage) return; // Guard clause: Hentikan jika di server

    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.error(`StorageService (${this.type}) set error:`, error);
    }
  }

  /**
   * Mengambil data dari storage (otomatis parse JSON)
   */
  get<T>(key: string): T | null {
    if (!this.storage) return null; // Guard clause

    try {
      const item = this.storage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`StorageService (${this.type}) get error:`, error);
      return null;
    }
  }

  /**
   * Menghapus item berdasarkan key
   */
  remove(key: string): void {
    if (!this.storage) return; // Guard clause

    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`StorageService (${this.type}) remove error:`, error);
    }
  }

  /**
   * Mengecek apakah key ada di storage
   */
  has(key: string): boolean {
    if (!this.storage) return false; // Guard clause
    return this.storage.getItem(key) !== null;
  }

  /**
   * Membersihkan seluruh storage
   */
  clear(): void {
    if (!this.storage) return; // Guard clause

    try {
      this.storage.clear();
    } catch (error) {
      console.error(`StorageService (${this.type}) clear error:`, error);
    }
  }

  // ============================================================================
  // Authentication & User (LocalStorage Specific)
  // ============================================================================

  setAccessToken(token: string): void {
    this.set(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  getAccessToken(): string | null {
    return this.get<string>(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  }

  setRefreshToken(token: string): void {
    this.set(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return this.get<string>(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  }

  setUser(user: unknown): void {
    this.set(LOCAL_STORAGE_KEYS.USER, user);
  }

  getUser<T>(): T | null {
    return this.get<T>(LOCAL_STORAGE_KEYS.USER);
  }

  setUserRole(role: string): void {
    this.set(LOCAL_STORAGE_KEYS.USER_ROLE, role);
  }

  getUserRole(): string | null {
    return this.get<string>(LOCAL_STORAGE_KEYS.USER_ROLE);
  }

  setLastLogin(timestamp: string): void {
    this.set(LOCAL_STORAGE_KEYS.LAST_LOGIN, timestamp);
  }

  /**
   * Hapus semua data terkait Autentikasi dan User
   */
  clearAuth(): void {
    this.remove(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    this.remove(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    this.remove(LOCAL_STORAGE_KEYS.USER);
    this.remove(LOCAL_STORAGE_KEYS.USER_ROLE);
    this.remove(LOCAL_STORAGE_KEYS.LAST_LOGIN);
  }

  // ============================================================================
  // UI & Preferences (LocalStorage Specific)
  // ============================================================================

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.set(LOCAL_STORAGE_KEYS.THEME, theme);
  }

  getTheme(): string | null {
    return this.get<string>(LOCAL_STORAGE_KEYS.THEME);
  }

  setLanguage(lang: string): void {
    this.set(LOCAL_STORAGE_KEYS.LANGUAGE, lang);
  }

  getLanguage(): string | null {
    return this.get<string>(LOCAL_STORAGE_KEYS.LANGUAGE);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.set(LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
  }

  getSidebarCollapsed(): boolean {
    return this.get<boolean>(LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED) ?? false;
  }

  setDentalChartView(viewMode: string): void {
    this.set(LOCAL_STORAGE_KEYS.DENTAL_CHART_VIEW, viewMode);
  }

  getDentalChartView(): string | null {
    return this.get<string>(LOCAL_STORAGE_KEYS.DENTAL_CHART_VIEW);
  }

  // ============================================================================
  // Session Data (SessionStorage Specific Helpers)
  // Note: Method ini sebaiknya dipanggil dari instance 'sessionStorageService'
  // ============================================================================

  setRedirectUrl(url: string): void {
    this.set(SESSION_STORAGE_KEYS.REDIRECT_URL, url);
  }

  getRedirectUrl(): string | null {
    return this.get<string>(SESSION_STORAGE_KEYS.REDIRECT_URL);
  }

  /**
   * Helper khusus untuk Form Data (Autosave)
   */
  setFormData(formId: string, data: unknown): void {
    this.set(`${SESSION_STORAGE_KEYS.FORM_DATA}_${formId}`, data);
  }

  getFormData<T>(formId: string): T | null {
    return this.get<T>(`${SESSION_STORAGE_KEYS.FORM_DATA}_${formId}`);
  }

  clearFormData(formId: string): void {
    this.remove(`${SESSION_STORAGE_KEYS.FORM_DATA}_${formId}`);
  }
}

// Export default instance untuk Local Storage (Penggunaan umum: Auth, User, UI)
export const storageService = new StorageService(StorageType.LOCAL);

// Export instance khusus untuk Session Storage (Penggunaan: Redirect, Form Data sementara)
export const sessionStorageService = new StorageService(StorageType.SESSION);