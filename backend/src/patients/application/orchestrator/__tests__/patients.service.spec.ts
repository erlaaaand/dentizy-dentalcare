import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from '../patients.service';
import { PatientCreationService } from '../../use-cases/patient-creation.service';
import { PatientFindService } from '../../use-cases/patient-find.service';
import { PatientSearchService } from '../../use-cases/patient-search.service';
import { PatientUpdateService } from '../../use-cases/patient-update.service';
import { PatientDeletionService } from '../../use-cases/patient-deletion.service';
import { PatientRestoreService } from '../../use-cases/patient-restore.service';
import { PatientStatisticsService } from '../../use-cases/patient-statistics.service';
import { CreatePatientDto } from '../../dto/create-patient.dto';
import { UpdatePatientDto } from '../../dto/update-patient.dto';
import { SearchPatientDto } from '../../dto/search-patient.dto';
import { PatientResponseDto } from '../../dto/patient-response.dto';

// ======================
// MOCK SEMUA DEPENDENSI (USE CASES)
// ======================
const mockCreationService = {
  execute: jest.fn(),
};
const mockFindService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByMedicalRecordNumber: jest.fn(),
  findByNik: jest.fn(),
  findByDoctor: jest.fn(),
};
const mockSearchService = {
  execute: jest.fn(),
};
const mockUpdateService = {
  execute: jest.fn(),
};
const mockDeletionService = {
  execute: jest.fn(),
};
const mockRestoreService = {
  execute: jest.fn(),
};
const mockStatisticsService = {
  execute: jest.fn(),
};

// ======================
// MOCK DATA
// ======================
const mockPatientResponse: Partial<PatientResponseDto> = {
  id: 1,
  nama_lengkap: 'John Doe',
  nomor_rekam_medis: '20250101-001',
};

const mockSearchQuery: SearchPatientDto = { page: 1, limit: 10 };

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService, // Service yang akan diuji
        // Sediakan mock untuk semua service yang di-inject
        {
          provide: PatientCreationService,
          useValue: mockCreationService,
        },
        { provide: PatientFindService, useValue: mockFindService },
        { provide: PatientSearchService, useValue: mockSearchService },
        { provide: PatientUpdateService, useValue: mockUpdateService },
        {
          provide: PatientDeletionService,
          useValue: mockDeletionService,
        },
        { provide: PatientRestoreService, useValue: mockRestoreService },
        {
          provide: PatientStatisticsService,
          useValue: mockStatisticsService,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  // Reset semua mock setelah setiap tes
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ------------------------------------
  // TEST CASES UNTUK SETIAP METHOD
  // ------------------------------------

  describe('create', () => {
    it('should call creationService.execute with correct DTO', async () => {
      const createDto: CreatePatientDto = {
        nama_lengkap: 'John Doe',
        nik: '1234567890123456',
        /* ...properti lain... */
      } as CreatePatientDto;

      mockCreationService.execute.mockResolvedValue(mockPatientResponse);

      const result = await service.create(createDto);

      expect(mockCreationService.execute).toHaveBeenCalledWith(createDto);
      expect(result).toBe(mockPatientResponse);
    });
  });

  describe('findAll', () => {
    it('should call findService.findAll with correct query', async () => {
      const paginatedResult = { data: [], total: 0, page: 1, limit: 10 };
      mockFindService.findAll.mockResolvedValue(paginatedResult);

      const result = await service.findAll(mockSearchQuery);

      expect(mockFindService.findAll).toHaveBeenCalledWith(mockSearchQuery);
      expect(result).toBe(paginatedResult);
    });
  });

  describe('search', () => {
    it('should call searchService.execute with correct query', async () => {
      const searchResult = { data: [mockPatientResponse], total: 1 };
      mockSearchService.execute.mockResolvedValue(searchResult);

      const result = await service.search(mockSearchQuery);

      expect(mockSearchService.execute).toHaveBeenCalledWith(mockSearchQuery);
      expect(result).toBe(searchResult);
    });
  });

  describe('getStatistics', () => {
    it('should call statisticsService.execute', async () => {
      const stats = { total: 10, new_this_month: 2, active: 8 };
      mockStatisticsService.execute.mockResolvedValue(stats);

      const result = await service.getStatistics();

      expect(mockStatisticsService.execute).toHaveBeenCalledTimes(1);
      expect(result).toBe(stats);
    });
  });

  describe('findOne', () => {
    it('should call findService.findOne with correct ID', async () => {
      const id = 1;
      mockFindService.findOne.mockResolvedValue(mockPatientResponse);

      const result = await service.findOne(id);

      expect(mockFindService.findOne).toHaveBeenCalledWith(id);
      expect(result).toBe(mockPatientResponse);
    });
  });

  describe('findByMedicalRecordNumber', () => {
    it('should call findService.findByMedicalRecordNumber with correct MRN', async () => {
      const mrn = '20250101-001';
      mockFindService.findByMedicalRecordNumber.mockResolvedValue(
        mockPatientResponse,
      );

      const result = await service.findByMedicalRecordNumber(mrn);

      expect(mockFindService.findByMedicalRecordNumber).toHaveBeenCalledWith(
        mrn,
      );
      expect(result).toBe(mockPatientResponse);
    });
  });

  describe('findByNik', () => {
    it('should call findService.findByNik with correct NIK', async () => {
      const nik = '1234567890123456';
      mockFindService.findByNik.mockResolvedValue(mockPatientResponse);

      const result = await service.findByNik(nik);

      expect(mockFindService.findByNik).toHaveBeenCalledWith(nik);
      expect(result).toBe(mockPatientResponse);
    });
  });

  describe('findByDoctor', () => {
    it('should call findService.findByDoctor with correct params', async () => {
      const doctorId = 123;
      const paginatedResult = { data: [], total: 0, page: 1, limit: 10 };
      mockFindService.findByDoctor.mockResolvedValue(paginatedResult);

      const result = await service.findByDoctor(doctorId, mockSearchQuery);

      expect(mockFindService.findByDoctor).toHaveBeenCalledWith(
        doctorId,
        mockSearchQuery,
      );
      expect(result).toBe(paginatedResult);
    });
  });

  describe('update', () => {
    it('should call updateService.execute with correct ID and DTO', async () => {
      const id = 1;
      const updateDto: UpdatePatientDto = {
        nama_lengkap: 'Jane Doe',
      } as UpdatePatientDto;
      const updatedResponse = {
        ...mockPatientResponse,
        nama_lengkap: 'Jane Doe',
      };

      mockUpdateService.execute.mockResolvedValue(updatedResponse);

      const result = await service.update(id, updateDto);

      expect(mockUpdateService.execute).toHaveBeenCalledWith(id, updateDto);
      expect(result).toBe(updatedResponse);
    });
  });

  describe('remove', () => {
    it('should call deletionService.execute with correct ID', async () => {
      const id = 1;
      const message = { message: 'Patient removed' };
      mockDeletionService.execute.mockResolvedValue(message);

      const result = await service.remove(id);

      expect(mockDeletionService.execute).toHaveBeenCalledWith(id);
      expect(result).toBe(message);
    });
  });

  describe('restore', () => {
    it('should call restoreService.execute with correct ID', async () => {
      const id = 1;
      const message = { message: 'Patient restored' };
      mockRestoreService.execute.mockResolvedValue(message);

      const result = await service.restore(id);

      expect(mockRestoreService.execute).toHaveBeenCalledWith(id);
      expect(result).toBe(message);
    });
  });
});
