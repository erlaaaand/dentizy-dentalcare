import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from '../../application/orchestrator/patients.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../auth/interface/guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { CreatePatientDto } from '../../application/dto/create-patient.dto';
import { UpdatePatientDto } from '../../application/dto/update-patient.dto';
import { SearchPatientDto } from '../../application/dto/search-patient.dto';
import { PatientResponseDto } from '../../application/dto/patient-response.dto';

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: jest.Mocked<PatientsService>; // Menggunakan jest.Mocked untuk type safety

  // ======================
  // MOCK SERVICE
  // ======================
  const mockPatientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
    getStatistics: jest.fn(),
    findByMedicalRecordNumber: jest.fn(),
    findByNik: jest.fn(),
    findByDoctor: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()], // Diperlukan untuk @UseInterceptors(CacheInterceptor)
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: mockPatientsService,
        },
        // Mock semua guards
        {
          provide: AuthGuard('jwt'),
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: ThrottlerGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    })
      // Override guards
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PatientsController>(PatientsController);
    service = module.get(PatientsService);
  });

  // Reset mocks setelah setiap tes
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ------------------------------------
  // TEST CASES UNTUK SETIAP ENDPOINT
  // ------------------------------------

  describe('create', () => {
    it('should create a new patient', async () => {
      const createDto: CreatePatientDto = {
        nama_lengkap: 'John Doe',
        nik: '1234567890123456',
        email: 'john@example.com',
        // ...properti lain
      } as CreatePatientDto;
      const expectedResult: Partial<PatientResponseDto> = {
        id: 1,
        nama_lengkap: 'John Doe',
      };

      service.create.mockResolvedValue(expectedResult as PatientResponseDto);

      const result = await controller.create(createDto);

      expect(result).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of patients', async () => {
      const query: SearchPatientDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      }; // Asumsikan service mengembalikan ini

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('search', () => {
    it('should return patient search results', async () => {
      const query: SearchPatientDto = { search: 'john' };
      const expectedResult: PatientResponseDto[] = [];

      service.search.mockResolvedValue(expectedResult);

      const result = await controller.search(query);

      expect(result).toBe(expectedResult);
      expect(service.search).toHaveBeenCalledWith(query);
    });
  });

  describe('getStatistics', () => {
    it('should return patient statistics', async () => {
      const expectedResult = {
        total: 100,
        new_this_month: 10,
        active: 95,
        with_allergies: 20,
        // ...properti statistik lain
      };

      service.getStatistics.mockResolvedValue(expectedResult);

      const result = await controller.getStatistics();

      expect(result).toBe(expectedResult);
      expect(service.getStatistics).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByMedicalRecordNumber', () => {
    it('should return a patient by MRN', async () => {
      const mrn = '20250101-001';
      const expectedResult: Partial<PatientResponseDto> = {
        id: 1,
        nomor_rekam_medis: mrn,
      };

      service.findByMedicalRecordNumber.mockResolvedValue(
        expectedResult as PatientResponseDto,
      );

      const result = await controller.findByMedicalRecordNumber(mrn);

      expect(result).toBe(expectedResult);
      expect(service.findByMedicalRecordNumber).toHaveBeenCalledWith(mrn);
    });
  });

  describe('findByNik', () => {
    it('should return a patient by NIK', async () => {
      const nik = '1234567890123456';
      const expectedResult: Partial<PatientResponseDto> = { id: 1, nik: nik };

      service.findByNik.mockResolvedValue(expectedResult as PatientResponseDto);

      const result = await controller.findByNik(nik);

      expect(result).toBe(expectedResult);
      expect(service.findByNik).toHaveBeenCalledWith(nik);
    });
  });

  describe('findByDoctor', () => {
    it('should return patients for a doctor', async () => {
      const doctorId = 5;
      const query: SearchPatientDto = { page: 1, limit: 10 };
      const expectedResult = { data: [], total: 0, page: 1, limit: 10 };

      service.findByDoctor.mockResolvedValue(expectedResult);

      const result = await controller.findByDoctor(doctorId, query);

      expect(result).toBe(expectedResult);
      expect(service.findByDoctor).toHaveBeenCalledWith(doctorId, query);
    });
  });

  describe('findOne', () => {
    it('should return a single patient by ID', async () => {
      const id = 1;
      const expectedResult: Partial<PatientResponseDto> = {
        id: 1,
        nama_lengkap: 'John Doe',
      };

      service.findOne.mockResolvedValue(expectedResult as PatientResponseDto);

      const result = await controller.findOne(id);

      expect(result).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const id = 1;
      const updateDto: UpdatePatientDto = { nama_lengkap: 'John Doe Updated' };
      const expectedResult: Partial<PatientResponseDto> = {
        id: 1,
        nama_lengkap: 'John Doe Updated',
      };

      service.update.mockResolvedValue(expectedResult as PatientResponseDto);

      const result = await controller.update(id, updateDto);

      expect(result).toBe(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove (soft delete)', () => {
    it('should soft delete a patient and return a message', async () => {
      const id = 1;
      const expectedMessage = { message: 'Pasien John Doe berhasil dihapus' };

      service.remove.mockResolvedValue(expectedMessage);

      const result = await controller.remove(id);

      expect(result).toEqual(expectedMessage);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('restore', () => {
    it('should restore a patient and return a message', async () => {
      const id = 1;
      const expectedMessage = { message: 'Pasien John Doe berhasil dipulihkan' };

      service.restore.mockResolvedValue(expectedMessage);

      const result = await controller.restore(id);

      expect(result).toEqual(expectedMessage);
      expect(service.restore).toHaveBeenCalledWith(id);
    });
  });
});