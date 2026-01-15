// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PatientCacheService } from '../../../infrastructure/cache/patient-cache.service';
import { SearchPatientDto } from '../../../application/dto/search-patient.dto';
import { PatientResponseDto } from '../../../application/dto/patient-response.dto';

// 2. MOCK DATA
const mockSearchQuery: SearchPatientDto = {
  page: 1,
  limit: 10,
  search: 'Budi',
};
const mockListQuery: SearchPatientDto = { page: 1, limit: 10 }; // Tanpa search param
const mockResult = { data: ['Patient A'], meta: { total: 1 } };
const mockPatientId = 123;
const mockPatientDto = { id: 123, nama_lengkap: 'Budi' } as PatientResponseDto;

// 3. TEST SUITE
describe('PatientCacheService', () => {
  let service: PatientCacheService;
  let cacheManager: Cache;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Mock Cache Manager dengan struktur khusus untuk handle 'stores[0].clear()'
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      // Mocking internal structure untuk method invalidateListCaches
      stores: [{ clear: jest.fn().mockResolvedValue(undefined) }],
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<PatientCacheService>(PatientCacheService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('getCachedListOrSearch', () => {
    it('should return cached data if available (Cache Hit)', async () => {
      // Arrange
      (cacheManager.get as jest.Mock).mockResolvedValue(mockResult);
      const fallbackMock = jest.fn();

      // Act
      const result = await service.getCachedListOrSearch(
        mockSearchQuery,
        fallbackMock,
      );

      // Assert
      expect(cacheManager.get).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
      expect(fallbackMock).not.toHaveBeenCalled(); // Fallback tidak boleh dipanggil
    });

    it('should execute fallback and set cache if data missing (Cache Miss)', async () => {
      // Arrange
      (cacheManager.get as jest.Mock).mockResolvedValue(null); // Miss
      const fallbackMock = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await service.getCachedListOrSearch(
        mockSearchQuery,
        fallbackMock,
      );

      // Assert
      expect(fallbackMock).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getCachedPatient', () => {
    it('should return cached patient if available', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockPatientDto);
      const fallbackMock = jest.fn();

      const result = await service.getCachedPatient(
        mockPatientId,
        fallbackMock,
      );

      expect(result).toEqual(mockPatientDto);
      expect(fallbackMock).not.toHaveBeenCalled();
    });

    it('should fetch and cache patient if missing', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      const fallbackMock = jest.fn().mockResolvedValue(mockPatientDto);

      const result = await service.getCachedPatient(
        mockPatientId,
        fallbackMock,
      );

      expect(fallbackMock).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining(`detail:{"id":${mockPatientId}}`), // Key check
        mockPatientDto,
        300000, // 300 seconds * 1000
      );
      expect(result).toEqual(mockPatientDto);
    });
  });

  describe('getCachedStats', () => {
    it('should cache stats with 1 minute TTL', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      const fallbackMock = jest.fn().mockResolvedValue({ total: 100 });

      await service.getCachedStats(fallbackMock);

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('stats'),
        { total: 100 },
        60000, // 60 seconds * 1000
      );
    });
  });

  // 6. SUB-GROUP TESTS (Logic & Invalidation)

  describe('TTL Logic (Search vs List)', () => {
    it('should use shorter TTL (60s) for SEARCH operations', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      const fallbackMock = jest.fn().mockResolvedValue(mockResult);

      await service.getCachedListOrSearch(mockSearchQuery, fallbackMock);

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        60000, // 60 * 1000
      );
    });

    it('should use standard TTL (300s) for LIST operations', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      const fallbackMock = jest.fn().mockResolvedValue(mockResult);

      await service.getCachedListOrSearch(mockListQuery, fallbackMock);

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        300000, // 300 * 1000
      );
    });
  });

  describe('Error Handling (Graceful Degradation)', () => {
    it('should return fallback result even if Cache Manager throws error', async () => {
      // Arrange
      const error = new Error('Redis connection failed');
      (cacheManager.get as jest.Mock).mockRejectedValue(error); // Simulasi cache error
      const fallbackMock = jest.fn().mockResolvedValue('Fallback Data');

      // Act
      const result = await service.getCachedListOrSearch(
        mockListQuery,
        fallbackMock,
      );

      // Assert
      expect(fallbackMock).toHaveBeenCalled(); // Tetap jalan meski cache error
      expect(result).toBe('Fallback Data');
      // Kita tidak expect error dilempar keluar (service menangkapnya)
    });
  });

  describe('Invalidation Logic', () => {
    it('should delete specific key for patient invalidation', async () => {
      await service.invalidatePatientCache(mockPatientId);

      expect(cacheManager.del).toHaveBeenCalledWith(
        expect.stringContaining(`detail:{"id":${mockPatientId}}`),
      );
    });

    it('should clear entire store for list invalidation', async () => {
      // Act
      await service.invalidateListCaches();

      // Assert
      // Mengakses mock stores[0].clear yang kita definisikan di beforeEach
      const mockStore = (cacheManager as any).stores[0];
      expect(mockStore.clear).toHaveBeenCalled();
    });

    it('should handle errors during invalidation gracefully', async () => {
      const mockStore = (cacheManager as any).stores[0];
      mockStore.clear.mockRejectedValue(new Error('Clear failed'));

      // Should not throw exception
      await expect(service.invalidateListCaches()).resolves.not.toThrow();
    });
  });
});
