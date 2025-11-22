// Storage utility functions and constants untuk Sistem Klinik Gigi

// Storage types
export enum StorageType {
    LOCAL = 'localStorage',
    SESSION = 'sessionStorage',
}

// Storage keys prefix untuk menghindari konflik
const STORAGE_PREFIX = 'dental_clinic_';

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: `${STORAGE_PREFIX}access_token`,
    REFRESH_TOKEN: `${STORAGE_PREFIX}refresh_token`,
    USER: `${STORAGE_PREFIX}user`,
    USER_ROLE: `${STORAGE_PREFIX}user_role`,
    THEME: `${STORAGE_PREFIX}theme`,
    LANGUAGE: `${STORAGE_PREFIX}language`,
    SIDEBAR_COLLAPSED: `${STORAGE_PREFIX}sidebar_collapsed`,
    REMEMBER_ME: `${STORAGE_PREFIX}remember_me`,
    LAST_LOGIN: `${STORAGE_PREFIX}last_login`,
    DENTAL_CHART_VIEW: `${STORAGE_PREFIX}dental_chart_view`,
    TABLE_PREFERENCES: `${STORAGE_PREFIX}table_preferences`,
} as const;

export const CACHE_KEYS = {
  APPOINTMENTS: 'appointments',
  PATIENTS: 'patients',
  MEDICAL_RECORDS: 'medical_records',
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
} as const;

export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
} as const;


// Session Storage Keys
export const SESSION_STORAGE_KEYS = {
    REDIRECT_URL: `${STORAGE_PREFIX}redirect_url`,
    FORM_DATA: `${STORAGE_PREFIX}form_data`,
    ACTIVE_TAB: `${STORAGE_PREFIX}active_tab`,
    SCROLL_POSITION: `${STORAGE_PREFIX}scroll_position`,
    SELECTED_DATE: `${STORAGE_PREFIX}selected_date`,
    FILTER_STATE: `${STORAGE_PREFIX}filter_state`,
} as const;

/**
 * Base storage class for type-safe storage operations
 */
class Storage {
    private storage: globalThis.Storage;

    constructor(type: StorageType) {
        this.storage = type === StorageType.LOCAL ? localStorage : sessionStorage;
    }

    /**
     * Get item from storage with type safety
     */
    get<T = any>(key: string): T | null {
        try {
            const item = this.storage.getItem(key);
            if (!item) return null;

            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`Error getting item from storage (${key}):`, error);
            return null;
        }
    }

    /**
     * Set item in storage with type safety
     */
    set<T = any>(key: string, value: T): boolean {
        try {
            this.storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting item in storage (${key}):`, error);
            return false;
        }
    }

    /**
     * Remove item from storage
     */
    remove(key: string): boolean {
        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing item from storage (${key}):`, error);
            return false;
        }
    }

    /**
     * Clear all items from storage
     */
    clear(): boolean {
        try {
            this.storage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Check if key exists in storage
     */
    has(key: string): boolean {
        return this.storage.getItem(key) !== null;
    }

    /**
     * Get all keys in storage
     */
    getAllKeys(): string[] {
        try {
            return Object.keys(this.storage);
        } catch (error) {
            console.error('Error getting all keys from storage:', error);
            return [];
        }
    }

    /**
     * Get all items with a specific prefix
     */
    getByPrefix(prefix: string): Record<string, any> {
        try {
            const items: Record<string, any> = {};
            const keys = this.getAllKeys().filter(key => key.startsWith(prefix));

            keys.forEach(key => {
                const value = this.get(key);
                if (value !== null) {
                    items[key] = value;
                }
            });

            return items;
        } catch (error) {
            console.error(`Error getting items by prefix (${prefix}):`, error);
            return {};
        }
    }

    /**
     * Remove all items with a specific prefix
     */
    removeByPrefix(prefix: string): boolean {
        try {
            const keys = this.getAllKeys().filter(key => key.startsWith(prefix));
            keys.forEach(key => this.remove(key));
            return true;
        } catch (error) {
            console.error(`Error removing items by prefix (${prefix}):`, error);
            return false;
        }
    }
}

// Storage instances
export const localStorageManager = new Storage(StorageType.LOCAL);
export const sessionStorageManager = new Storage(StorageType.SESSION);

/**
 * Helper functions for common storage operations
 */

// Token management (untuk autentikasi)
export const tokenStorage = {
    getAccessToken: (): string | null =>
        localStorageManager.get<string>(LOCAL_STORAGE_KEYS.ACCESS_TOKEN),

    setAccessToken: (token: string): boolean =>
        localStorageManager.set(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, token),

    getRefreshToken: (): string | null =>
        localStorageManager.get<string>(LOCAL_STORAGE_KEYS.REFRESH_TOKEN),

    setRefreshToken: (token: string): boolean =>
        localStorageManager.set(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token),

    setTokens: (accessToken: string, refreshToken: string): boolean => {
        const accessSet = localStorageManager.set(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        const refreshSet = localStorageManager.set(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        return accessSet && refreshSet;
    },

    removeTokens: (): boolean => {
        localStorageManager.remove(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
        localStorageManager.remove(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
        return true;
    },

    hasTokens: (): boolean =>
        localStorageManager.has(LOCAL_STORAGE_KEYS.ACCESS_TOKEN) &&
        localStorageManager.has(LOCAL_STORAGE_KEYS.REFRESH_TOKEN),
};

// User data management
export const userStorage = {
    getUser: <T = any>(): T | null =>
        localStorageManager.get<T>(LOCAL_STORAGE_KEYS.USER),

    setUser: <T = any>(user: T): boolean =>
        localStorageManager.set(LOCAL_STORAGE_KEYS.USER, user),

    getUserRole: (): string | null =>
        localStorageManager.get<string>(LOCAL_STORAGE_KEYS.USER_ROLE),

    setUserRole: (role: string): boolean =>
        localStorageManager.set(LOCAL_STORAGE_KEYS.USER_ROLE, role),

    removeUser: (): boolean => {
        localStorageManager.remove(LOCAL_STORAGE_KEYS.USER);
        localStorageManager.remove(LOCAL_STORAGE_KEYS.USER_ROLE);
        return true;
    },

    hasUser: (): boolean =>
        localStorageManager.has(LOCAL_STORAGE_KEYS.USER),

    getLastLogin: (): string | null =>
        localStorageManager.get<string>(LOCAL_STORAGE_KEYS.LAST_LOGIN),

    setLastLogin: (timestamp: string): boolean =>
        localStorageManager.set(LOCAL_STORAGE_KEYS.LAST_LOGIN, timestamp),
};

// Theme management
export const themeStorage = {
    getTheme: (): string | null =>
        localStorageManager.get<string>(LOCAL_STORAGE_KEYS.THEME),

    setTheme: (theme: string): boolean =>
        localStorageManager.set(LOCAL_STORAGE_KEYS.THEME, theme),

    removeTheme: (): boolean =>
        localStorageManager.remove(LOCAL_STORAGE_KEYS.THEME),
};

// Sidebar state management
export const sidebarStorage = {
    isCollapsed: (): boolean =>
        localStorageManager.get<boolean>(LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED) ?? false,

    setCollapsed: (collapsed: boolean): boolean =>
        localStorageManager.set(LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed),
};

// Session redirect management
export const redirectStorage = {
    getRedirectUrl: (): string | null =>
        sessionStorageManager.get<string>(SESSION_STORAGE_KEYS.REDIRECT_URL),

    setRedirectUrl: (url: string): boolean =>
        sessionStorageManager.set(SESSION_STORAGE_KEYS.REDIRECT_URL, url),

    removeRedirectUrl: (): boolean =>
        sessionStorageManager.remove(SESSION_STORAGE_KEYS.REDIRECT_URL),

    hasRedirectUrl: (): boolean =>
        sessionStorageManager.has(SESSION_STORAGE_KEYS.REDIRECT_URL),
};

// Form data management (untuk autosave)
export const formStorage = {
    saveFormData: (formId: string, data: any): boolean =>
        sessionStorageManager.set(`${SESSION_STORAGE_KEYS.FORM_DATA}_${formId}`, data),

    getFormData: <T = any>(formId: string): T | null =>
        sessionStorageManager.get<T>(`${SESSION_STORAGE_KEYS.FORM_DATA}_${formId}`),

    removeFormData: (formId: string): boolean =>
        sessionStorageManager.remove(`${SESSION_STORAGE_KEYS.FORM_DATA}_${formId}`),

    clearAllFormData: (): boolean =>
        sessionStorageManager.removeByPrefix(SESSION_STORAGE_KEYS.FORM_DATA),
};

// Dental chart view preferences
export const dentalChartStorage = {
    getViewMode: (): string | null =>
        localStorageManager.get<string>(LOCAL_STORAGE_KEYS.DENTAL_CHART_VIEW),

    setViewMode: (mode: string): boolean =>
        localStorageManager.set(LOCAL_STORAGE_KEYS.DENTAL_CHART_VIEW, mode),
};

/**
 * Clear all application storage (untuk logout)
 */
export function clearAllStorage(): boolean {
    try {
        localStorageManager.removeByPrefix(STORAGE_PREFIX);
        sessionStorageManager.removeByPrefix(STORAGE_PREFIX);
        return true;
    } catch (error) {
        console.error('Error clearing all storage:', error);
        return false;
    }
}

/**
 * Clear only session data (tetap simpan preferences)
 */
export function clearSessionData(): boolean {
    try {
        tokenStorage.removeTokens();
        userStorage.removeUser();
        sessionStorageManager.clear();
        return true;
    } catch (error) {
        console.error('Error clearing session data:', error);
        return false;
    }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(type: StorageType): boolean {
    try {
        const storage = type === StorageType.LOCAL ? localStorage : sessionStorage;
        const test = '__storage_test__';
        storage.setItem(test, test);
        storage.removeItem(test);
        return true;
    } catch (error) {
        console.warn(`${type} is not available:`, error);
        return false;
    }
}

/**
 * Get storage usage info (untuk debugging)
 */
export function getStorageInfo(): {
    localStorage: { used: number; available: boolean };
    sessionStorage: { used: number; available: boolean };
} {
    const getSize = (storage: globalThis.Storage): number => {
        let size = 0;
        for (const key in storage) {
            if (storage.hasOwnProperty(key)) {
                size += storage[key].length + key.length;
            }
        }
        return size;
    };

    return {
        localStorage: {
            used: getSize(localStorage),
            available: isStorageAvailable(StorageType.LOCAL),
        },
        sessionStorage: {
            used: getSize(sessionStorage),
            available: isStorageAvailable(StorageType.SESSION),
        },
    };
}