// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { PatientSearchService } from '../patient-search.service';
import { Patient } from '../../../domains/entities/patient.entity';
import { SearchPatientDto } from '../../dto/search-patient.dto';
import { PatientQueryBuilder } from '../../../infrastructure/persistence/query/patient-query.builder';
import { PatientValidator } from '../../../domains/validators/patient.validator';
import { PatientCacheService } from '../../../infrastructure/cache/patient-cache.service';
import { PatientMapper } from '../../../domains/mappers/patient.mapper';

// 2. MOCK DATA
const mockPatient = {
  id: 1,
  nama_lengkap: 'Budi Search',
  created_at: new Date(),
} as Patient;

const mockSearchQuery: SearchPatientDto = {
  page: 2,
  limit: 5,
  search: 'Budi',
  is_active: true,
};

const mockResponseDto = {
  id: 1,
  nama_lengkap: 'Budi Search',
};

// Mock untuk TypeORM Query Builder (Chainable methods)
const mockTypeOrmQueryBuilder = {
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(), // Akan di-override per test case
};

// 3. TEST SUITE
describe('PatientSearchService', () => {
  let service: PatientSearchService;
  let repository: Repository<Patient>;
  let queryBuilderService: any;
  let validator: any;
  let cacheService: any;
  let mapper: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Mock Custom Query Builder Service
    const mockPatientQueryBuilder = {
      build: jest.fn().mockReturnValue(mockTypeOrmQueryBuilder),
    };

    // Mock Repository
    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockTypeOrmQueryBuilder),
    };

    // Mock Validator
    const mockValidator = {
      validateSearchQuery: jest.fn(),
    };

    // Mock Cache Service (Directly execute callback)
    const mockCacheService = {
      getCachedListOrSearch: jest.fn((query, callback) => callback()),
    };

    // Mock Mapper
    const mockMapper = {
      toResponseDtoList: jest.fn().mockReturnValue([mockResponseDto]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientSearchService,
        { provide: getRepositoryToken(Patient), useValue: mockRepository },
        { provide: PatientQueryBuilder, useValue: mockPatientQueryBuilder },
        { provide: PatientValidator, useValue: mockValidator },
        { provide: PatientCacheService, useValue: mockCacheService },
        { provide: PatientMapper, useValue: mockMapper },
      ],
    }).compile();

    service = module.get<PatientSearchService>(PatientSearchService);
    repository = module.get<Repository<Patient>>(getRepositoryToken(Patient));
    queryBuilderService = module.get(PatientQueryBuilder);
    validator = module.get(PatientValidator);
    cacheService = module.get(PatientCacheService);
    mapper = module.get(PatientMapper);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('execute', () => {
    it('should search patients successfully with pagination and filters', async () => {
      // Arrange
      const totalCount = 15;
      mockTypeOrmQueryBuilder.getManyAndCount.mockResolvedValue([
        [mockPatient],
        totalCount,
      ]);

      // Act
      const result = await service.execute(mockSearchQuery);

      // Assert
      // 1. Check Cache Wrapper
      expect(cacheService.getCachedListOrSearch).toHaveBeenCalled();

      // 2. Check Validation
      expect(validator.validateSearchQuery).toHaveBeenCalledWith(
        mockSearchQuery,
      );

      // 3. Check Builder Logic
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('patient');
      expect(queryBuilderService.build).toHaveBeenCalledWith(
        mockTypeOrmQueryBuilder,
        mockSearchQuery,
      );

      // 4. Check Pagination Calculations
      // Page 2, Limit 5 -> Skip = (2-1)*5 = 5
      expect(mockTypeOrmQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(mockTypeOrmQueryBuilder.skip).toHaveBeenCalledWith(5);

      // 5. Check Execution
      expect(mockTypeOrmQueryBuilder.getManyAndCount).toHaveBeenCalled();

      // 6. Check Result Structure & Metadata
      expect(mapper.toResponseDtoList).toHaveBeenCalledWith([mockPatient]);
      expect(result).toEqual({
        data: [mockResponseDto],
        pagination: {
          total: totalCount,
          page: 2,
          limit: 5,
          totalPages: 3, // 15 item / 5 limit = 3 pages
        },
      });
    });

    // 6. SUB-GROUP TESTS (Error Handling)

    it('should re-throw BadRequestException if validation fails', async () => {
      // Arrange
      const error = new BadRequestException('Invalid query param');
      validator.validateSearchQuery.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(service.execute(mockSearchQuery)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.execute(mockSearchQuery)).rejects.toThrow(
        'Invalid query param',
      );

      // Verify execution stopped before DB call
      expect(queryBuilderService.build).not.toHaveBeenCalled();
      expect(mockTypeOrmQueryBuilder.getManyAndCount).not.toHaveBeenCalled();
    });

    it('should wrap generic errors into BadRequestException', async () => {
      // Arrange
      mockTypeOrmQueryBuilder.getManyAndCount.mockRejectedValue(
        new Error('Database Connection Failed'),
      );

      // Act & Assert
      // Kode Anda menangkap error umum dan melempar BadRequest baru
      await expect(service.execute(mockSearchQuery)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.execute(mockSearchQuery)).rejects.toThrow(
        'Gagal mencari pasien. Silakan coba lagi.',
      );
    });

    it('should handle default pagination values correctly', async () => {
      // Arrange
      const emptyQuery: SearchPatientDto = {}; // page undefined, limit undefined
      mockTypeOrmQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      // Act
      await service.execute(emptyQuery);

      // Assert
      // Default: Page 1, Limit 10 -> Skip 0
      expect(mockTypeOrmQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockTypeOrmQueryBuilder.skip).toHaveBeenCalledWith(0);
    });
  });
});
