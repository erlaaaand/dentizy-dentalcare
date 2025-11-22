// frontend/src/core/services/cache/cache.service.ts
interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresIn: number;
}

export class CacheService {
    private cache: Map<string, CacheItem<unknown>>;
    private readonly defaultTTL: number;

    constructor(defaultTTL: number = 5 * 60 * 1000) {
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }

    set<T>(key: string, data: T, ttl?: number): void {
        const expiresIn = ttl || this.defaultTTL;
        const cacheItem: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            expiresIn,
        };
        this.cache.set(key, cacheItem);
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key) as CacheItem<T> | undefined;

        if (!item) {
            return null;
        }

        const isExpired = Date.now() - item.timestamp > item.expiresIn;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    has(key: string): boolean {
        return this.cache.has(key) && this.get(key) !== null;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    clearExpired(): void {
        const now = Date.now();
        this.cache.forEach((item, key) => {
            if (now - item.timestamp > item.expiresIn) {
                this.cache.delete(key);
            }
        });
    }
}

export const cacheService = new CacheService();