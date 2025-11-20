// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { PatientFindService } from '../patient-find.service';
import { Patient } from '../../../domains/entities/patient.entity';
import { PatientCacheService } from '../../../infrastructure/cache/patient-cache.service';
import { PatientMapper } from '../../../domains/mappers/patient.mapper';
import { SearchPatientDto } from '../../dto/search-patient.dto';
import { PatientResponseDto } from '../../dto/patient-response.dto';

// 2. MOCK DATA
const mockPatient = {
  id: 1,
  nama_lengkap: 'Budi Santoso',
  nomor_rekam_medis: 'RM-001',
  nik: '1234567890123456',
  is_active: true,
  created_at: new Date(),
} as Patient;

const mockResponseDto = {
  id: 1,
  nama_lengkap: 'Budi Santoso',
  nomor_rekam_medis: 'RM-001',
} as PatientResponseDto;

const mockSearchQuery: SearchPatientDto = {
  page: 1,
  limit: 10,
  search: 'Budi',
};

// Mock untuk QueryBuilder (digunakan di findByDoctor)
const mockQueryBuilder = {
  leftJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  distinct: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockPatient], 1]),
};

// 3. TEST SUITE
describe('PatientFindService', () => {
  let service: PatientFindService;
  let repository: Repository<Patient>;
  let cacheService: any;
  let mapper: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Mock Repository
    const mockRepository = {
      findAndCount: jest.fn().mockResolvedValue([[mockPatient], 1]),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    // Mock Cache Service (PENTING: Jalankan callback)
    // Kita membuat mock yang langsung menjalankan fungsi query yang dibungkus cache
    const mockCacheService = {
      getCachedListOrSearch: jest.fn((query, callback) => callback()), 
      getCachedPatient: jest.fn((id, callback) => callback()),
    };

    // Mock Mapper
    const mockMapper = {
      toResponseDto: jest.fn().mockReturnValue(mockResponseDto),
      toResponseDtoList: jest.fn().mockReturnValue([mockResponseDto]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientFindService,
        { provide: getRepositoryToken(Patient), useValue: mockRepository },
        { provide: PatientCacheService, useValue: mockCacheService },
        { provide: PatientMapper, useValue: mockMapper },
      ],
    }).compile();

    service = module.get<PatientFindService>(PatientFindService);
    repository = module.get<Repository<Patient>>(getRepositoryToken(Patient));
    cacheService = module.get(PatientCacheService);
    mapper = module.get(PatientMapper);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('findAll', () => {
    it('should return paginated patient list', async () => {
      // Act
      const result = await service.findAll(mockSearchQuery);

      // Assert
      expect(cacheService.getCachedListOrSearch).toHaveBeenCalled();
      expect(repository.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        take: 10,
        skip: 0,
        where: { is_active: true },
        order: { created_at: 'DESC' },
      }));
      expect(mapper.toResponseDtoList).toHaveBeenCalledWith([mockPatient]);
      expect(result).toEqual({
        data: [mockResponseDto],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should throw BadRequestException on repo error', async () => {
      (repository.findAndCount as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.findAll(mockSearchQuery)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a patient by ID', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockPatient);

      const result = await service.findOne(1);

      expect(cacheService.getCachedPatient).toHaveBeenCalledWith(1, expect.any(Function));
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['appointments', 'medical_records'],
      });
      expect(result).toEqual(mockResponseDto);
    });

    it('should throw NotFoundException if patient not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // 6. SUB-GROUP TESTS (Specific Finders & QueryBuilder)

  describe('findByMedicalRecordNumber', () => {
    it('should return patient found by RM', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockPatient);

      const result = await service.findByMedicalRecordNumber('RM-001');

      expect(repository.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { nomor_rekam_medis: 'RM-001' }
      }));
      expect(result).toEqual(mockResponseDto);
    });

    it('should throw NotFoundException if RM not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findByMedicalRecordNumber('RM-X')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByNik', () => {
    it('should return patient found by NIK', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockPatient);

      await service.findByNik('12345');

      expect(repository.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { nik: '12345' }
      }));
    });
  });

  describe('findByDoctor', () => {
    const doctorId = 5;

    it('should execute complex query using QueryBuilder', async () => {
      // Act
      const result = await service.findByDoctor(doctorId, mockSearchQuery);

      // Assert Structure
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('patient');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('patient.appointments', 'appointment');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('appointment.doctor_id = :doctorId', { doctorId });
      
      // Check pagination
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      
      // Result check
      expect(result.data).toEqual([mockResponseDto]);
    });

    it('should apply search filter logic in QueryBuilder if search param exists', async () => {
      const queryWithSearch = { ...mockSearchQuery, search: 'CariNama' };
      
      await service.findByDoctor(doctorId, queryWithSearch);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('patient.nama_lengkap LIKE :search'),
        { search: '%CariNama%' }
      );
    });

    it('should throw BadRequestException if QueryBuilder fails', async () => {
      mockQueryBuilder.getManyAndCount.mockRejectedValue(new Error('Query Failed'));

      await expect(service.findByDoctor(doctorId, mockSearchQuery)).rejects.toThrow(BadRequestException);
    });
  });
});