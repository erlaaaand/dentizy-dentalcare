/**
 * Storage Utility Functions
 * Provides helper functions for localStorage and sessionStorage
 */

type StorageType = 'local' | 'session';

/**
 * Check if storage is available
 */
function isStorageAvailable(type: StorageType): boolean {
    try {
        const storage = type === 'local' ? localStorage : sessionStorage;
        const testKey = '__storage_test__';
        storage.setItem(testKey, 'test');
        storage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get storage object
 */
function getStorage(type: StorageType): Storage {
    return type === 'local' ? localStorage : sessionStorage;
}

/**
 * Set item in storage with JSON serialization
 */
export function setItem<T>(
    key: string,
    value: T,
    type: StorageType = 'local'
): boolean {
    try {
        if (!isStorageAvailable(type)) {
            console.warn(`${type}Storage is not available`);
            return false;
        }

        const storage = getStorage(type);
        const serializedValue = JSON.stringify(value);
        storage.setItem(key, serializedValue);
        return true;
    } catch (error) {
        console.error(`Error setting ${type}Storage item:`, error);
        return false;
    }
}

/**
 * Get item from storage with JSON deserialization
 */
export function getItem<T>(
    key: string,
    type: StorageType = 'local'
): T | null {
    try {
        if (!isStorageAvailable(type)) {
            return null;
        }

        const storage = getStorage(type);
        const item = storage.getItem(key);

        if (item === null) {
            return null;
        }

        return JSON.parse(item) as T;
    } catch (error) {
        console.error(`Error getting ${type}Storage item:`, error);
        return null;
    }
}

/**
 * Remove item from storage
 */
export function removeItem(
    key: string,
    type: StorageType = 'local'
): boolean {
    try {
        if (!isStorageAvailable(type)) {
            return false;
        }

        const storage = getStorage(type);
        storage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing ${type}Storage item:`, error);
        return false;
    }
}

/**
 * Clear all items from storage
 */
export function clear(type: StorageType = 'local'): boolean {
    try {
        if (!isStorageAvailable(type)) {
            return false;
        }

        const storage = getStorage(type);
        storage.clear();
        return true;
    } catch (error) {
        console.error(`Error clearing ${type}Storage:`, error);
        return false;
    }
}

/**
 * Get all keys from storage
 */
export function keys(type: StorageType = 'local'): string[] {
    try {
        if (!isStorageAvailable(type)) {
            return [];
        }

        const storage = getStorage(type);
        return Object.keys(storage);
    } catch (error) {
        console.error(`Error getting ${type}Storage keys:`, error);
        return [];
    }
}

/**
 * Check if key exists in storage
 */
export function hasItem(
    key: string,
    type: StorageType = 'local'
): boolean {
    try {
        if (!isStorageAvailable(type)) {
            return false;
        }

        const storage = getStorage(type);
        return storage.getItem(key) !== null;
    } catch (error) {
        console.error(error);
        return false;
    }
}

/**
 * Get storage size in bytes
 */
export function getSize(type: StorageType = 'local'): number {
    try {
        if (!isStorageAvailable(type)) {
            return 0;
        }

        const storage = getStorage(type);
        let size = 0;

        for (const key in storage) {
            if (storage.hasOwnProperty(key)) {
                size += key.length + (storage.getItem(key)?.length || 0);
            }
        }

        return size;
    } catch (error) {
        return 0;
    }
}

/**
 * Set item with expiration time
 */
export function setItemWithExpiry<T>(
    key: string,
    value: T,
    expiryMs: number,
    type: StorageType = 'local'
): boolean {
    try {
        const item = {
            value,
            expiry: Date.now() + expiryMs,
        };

        return setItem(key, item, type);
    } catch (error) {
        console.error(`Error setting ${type}Storage item with expiry:`, error);
        return false;
    }
}

/**
 * Get item with expiration check
 */
export function getItemWithExpiry<T>(
    key: string,
    type: StorageType = 'local'
): T | null {
    try {
        const item = getItem<{ value: T; expiry: number }>(key, type);

        if (!item) {
            return null;
        }

        if (Date.now() > item.expiry) {
            removeItem(key, type);
            return null;
        }

        return item.value;
    } catch (error) {
        console.error(`Error getting ${type}Storage item with expiry:`, error);
        return null;
    }
}

/**
 * Set item in localStorage
 */
export function setLocal<T>(key: string, value: T): boolean {
    return setItem(key, value, 'local');
}

/**
 * Get item from localStorage
 */
export function getLocal<T>(key: string): T | null {
    return getItem<T>(key, 'local');
}

/**
 * Remove item from localStorage
 */
export function removeLocal(key: string): boolean {
    return removeItem(key, 'local');
}

/**
 * Set item in sessionStorage
 */
export function setSession<T>(key: string, value: T): boolean {
    return setItem(key, value, 'session');
}

/**
 * Get item from sessionStorage
 */
export function getSession<T>(key: string): T | null {
    return getItem<T>(key, 'session');
}

/**
 * Remove item from sessionStorage
 */
export function removeSession(key: string): boolean {
    return removeItem(key, 'session');
}

/**
 * Subscribe to storage changes
 */
export function subscribe(
    key: string,
    callback: (newValue: unknown, oldValue: unknown) => void,
    type: StorageType = 'local'
): () => void {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key && e.storageArea === getStorage(type)) {
            try {
                const newValue = e.newValue ? JSON.parse(e.newValue) : null;
                const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null;
                callback(newValue, oldValue);
            } catch (error) {
                console.error('Error parsing storage event:', error);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Return unsubscribe function
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
}

/**
 * Backup storage to object
 */
export function backup(type: StorageType = 'local'): Record<string, unknown> {
    try {
        if (!isStorageAvailable(type)) {
            return {};
        }

        const storage = getStorage(type);
        const backup: Record<string, unknown> = {};

        for (const key in storage) {
            if (storage.hasOwnProperty(key)) {
                try {
                    backup[key] = JSON.parse(storage.getItem(key) || '');
                } catch {
                    backup[key] = storage.getItem(key);
                }
            }
        }

        return backup;
    } catch (error) {
        console.error(`Error backing up ${type}Storage:`, error);
        return {};
    }
}

/**
 * Restore storage from backup
 */
export function restore(
    data: Record<string, unknown>,
    type: StorageType = 'local'
): boolean {
    try {
        if (!isStorageAvailable(type)) {
            return false;
        }

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                setItem(key, data[key], type);
            }
        }

        return true;
    } catch (error) {
        console.error(`Error restoring ${type}Storage:`, error);
        return false;
    }
}

/**
 * Remove items by prefix
 */
export function removeByPrefix(
    prefix: string,
    type: StorageType = 'local'
): number {
    try {
        if (!isStorageAvailable(type)) {
            return 0;
        }

        const storage = getStorage(type);
        const keysToRemove = Object.keys(storage).filter((key) =>
            key.startsWith(prefix)
        );

        keysToRemove.forEach((key) => storage.removeItem(key));

        return keysToRemove.length;
    } catch (error) {
        console.error(`Error removing ${type}Storage items by prefix:`, error);
        return 0;
    }
}

/**
 * Get all items as object
 */
export function getAll(type: StorageType = 'local'): Record<string, unknown> {
    return backup(type);
}

/**
 * Merge object into storage
 */
export function merge(
    data: Record<string, unknown>,
    type: StorageType = 'local'
): boolean {
    try {
        if (!isStorageAvailable(type)) {
            return false;
        }

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const existing = getItem<unknown>(key, type);

                if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
                    setItem(key, { ...existing, ...data[key] as object }, type);
                } else {
                    setItem(key, data[key], type);
                }
            }
        }

        return true;
    } catch (error) {
        console.error(`Error merging ${type}Storage:`, error);
        return false;
    }
}