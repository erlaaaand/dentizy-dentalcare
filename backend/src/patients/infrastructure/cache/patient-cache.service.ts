import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PatientResponseDto } from '../../application/dto/patient-response.dto';
import { SearchPatientDto } from '../../application/dto/search-patient.dto';

@Injectable()
export class PatientCacheService {
    private readonly logger = new Logger(PatientCacheService.name);
    private readonly CACHE_TTL_SECONDS = 300; // 5 menit
    private readonly CACHE_PREFIX = 'patient:';

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    /**
     * Helper untuk membuat cache key yang konsisten
     */
    private getCacheKey(operation: string, params: any): string {
        const paramsStr = JSON.stringify(params);
        return `${this.CACHE_PREFIX}${operation}:${paramsStr}`;
    }

    /**
     * Membungkus pengambilan data list/search dengan caching.
     */
    async getCachedListOrSearch(
        query: SearchPatientDto,
        fallback: () => Promise<any>,
    ): Promise<any> {
        const operation = query.search ? 'search' : 'list';
        const cacheKey = this.getCacheKey(operation, query);

        try {
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                this.logger.debug(`📦 Cache hit: ${cacheKey}`);
                return cached;
            }

            this.logger.debug(`📦 Cache miss: ${cacheKey}`);
            const result = await fallback();

            // Cache hasil pencarian lebih singkat
            const ttl = operation === 'search' ? 60 : this.CACHE_TTL_SECONDS;
            await this.cacheManager.set(cacheKey, result, ttl * 1000); // Convert to ms

            return result;
        } catch (error) {
            this.logger.error(`Error in cache operation: ${error.message}`);
            // Fallback to direct query on cache error
            return fallback();
        }
    }

    /**
     * Membungkus pengambilan data findOne dengan caching.
     */
    async getCachedPatient(
        id: number,
        fallback: () => Promise<PatientResponseDto>,
    ): Promise<PatientResponseDto> {
        const cacheKey = this.getCacheKey('detail', { id });

        try {
            const cached = await this.cacheManager.get<PatientResponseDto>(cacheKey);
            if (cached) {
                this.logger.debug(`📦 Cache hit: ${cacheKey}`);
                return cached;
            }

            this.logger.debug(`📦 Cache miss: ${cacheKey}`);
            const result = await fallback();
            await this.cacheManager.set(cacheKey, result, this.CACHE_TTL_SECONDS * 1000);

            return result;
        } catch (error) {
            this.logger.error(`Error in cache operation: ${error.message}`);
            return fallback();
        }
    }

    /**
     * Membungkus pengambilan data statistik dengan caching.
     */
    async getCachedStats(fallback: () => Promise<any>): Promise<any> {
        const cacheKey = this.getCacheKey('stats', {});

        try {
            const cached = await this.cacheManager.get(cacheKey);

            if (cached) {
                this.logger.debug(`📦 Cache hit: ${cacheKey}`);
                return cached;
            }

            this.logger.debug(`📦 Cache miss: ${cacheKey}`);
            const stats = await fallback();
            await this.cacheManager.set(cacheKey, stats, 60 * 1000); // Cache stats 1 menit
            return stats;
        } catch (error) {
            this.logger.error(`Error in cache operation: ${error.message}`);
            return fallback();
        }
    }

    /**
     * Meng-invalidate cache untuk satu pasien (by ID).
     */
    async invalidatePatientCache(id: number): Promise<void> {
        try {
            const cacheKey = this.getCacheKey('detail', { id });
            await this.cacheManager.del(cacheKey);
            this.logger.log(`💨 Invalidated cache: ${cacheKey}`);
        } catch (error) {
            this.logger.error(`Error invalidating cache: ${error.message}`);
        }
    }

    /**
     * Meng-invalidate semua cache yang terkait dengan list, search, dan stats.
     */
    async invalidateListCaches(): Promise<void> {
        try {
            this.logger.warn(
                `💨 Invalidating all list/search/stats caches. (Using 'reset' for memory store)`,
            );
            // PERHATIAN: 'cache-manager' (terutama memory store) tidak punya
            // metode 'del' berbasis pattern (seperti SCAN di Redis).
            // Metode 'reset' adalah 'opsi nuklir' yang akan menghapus SEMUA cache.
            // Jika Anda menggunakan Redis, ganti ini dengan logika 'SCAN' dan 'DEL'.
            await (this.cacheManager as any).stores[0].clear();
            this.logger.log(`💨 All cache cleared.`);
        } catch (error) {
            this.logger.error(`Error invalidating list caches: ${error.message}`);
        }
    }

    /**
     * Get cache store untuk monitoring (optional)
     */
    async getCacheStore(): Promise<Cache> {
        return this.cacheManager;
    }
}