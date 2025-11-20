// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { PatientStatisticsService } from '../patient-statistics.service';
import { PatientRepository } from '../../../infrastructure/persistence/repositories/patients.repository';
import { PatientCacheService } from '../../../infrastructure/cache/patient-cache.service';

// 2. MOCK DATA
const mockStats = {
  total: 150,
  new_this_month: 12,
  active: 140,
};

// 3. TEST SUITE
describe('PatientStatisticsService', () => {
  let service: PatientStatisticsService;
  let customRepository: any;
  let cacheService: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Mock Repository
    customRepository = {
      getStatistics: jest.fn(),
    };

    // Mock Cache Service
    // PENTING: Kita harus mengeksekusi callback yang dikirim ke getCachedStats
    // agar logika pemanggilan repository di dalamnya tereksekusi.
    cacheService = {
      getCachedStats: jest.fn((callback) => callback()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientStatisticsService,
        { provide: PatientRepository, useValue: customRepository },
        { provide: PatientCacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get<PatientStatisticsService>(PatientStatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('execute', () => {
    it('should return statistics from repository via cache wrapper', async () => {
      // Arrange
      customRepository.getStatistics.mockResolvedValue(mockStats);

      // Act
      const result = await service.execute();

      // Assert
      // 1. Pastikan Cache Wrapper dipanggil
      expect(cacheService.getCachedStats).toHaveBeenCalled();
      
      // 2. Pastikan Repository dipanggil (membuktikan callback dijalankan)
      expect(customRepository.getStatistics).toHaveBeenCalled();
      
      // 3. Pastikan hasil sesuai
      expect(result).toEqual(mockStats);
    });

    it('should propagate errors if repository fails', async () => {
      // Arrange
      const error = new Error('Database Query Failed');
      customRepository.getStatistics.mockRejectedValue(error);

      // Act & Assert
      // Service tidak memiliki try-catch sendiri, jadi error harus diteruskan
      await expect(service.execute()).rejects.toThrow('Database Query Failed');
    });
  });
});