// ============================================================================
// IMPORTS
// ============================================================================
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MedicalRecordSearchService } from '../medical-record-search.service';
import { MedicalRecord } from '../../../domains/entities/medical-record.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { MedicalRecordAuthorizationService } from '../../../domains/services/medical-record-authorization.service';
import { SearchMedicalRecordDto } from '../../dto/search-medical-record.dto';
import { AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

// ============================================================================
// MOCK DATA
// ============================================================================
const mockKepalaKlinik: User = {
  id: 1,
  nama_lengkap: 'Kepala Klinik',
  roles: [{ id: 1, name: UserRole.KEPALA_KLINIK }],
} as User;

const mockDokter: User = {
  id: 2,
  nama_lengkap: 'Dr. Test',
  roles: [{ id: 2, name: UserRole.DOKTER }],
} as User;

const mockStaf: User = {
  id: 3,
  nama_lengkap: 'Staf Test',
  roles: [{ id: 3, name: UserRole.STAF }],
} as User;

const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 1,
    patient_id: 100,
    doctor_id: 2,
    appointment_id: 1,
    subjektif: 'Pasien mengeluh demam',
    objektif: 'Suhu 38.5°C',
    assessment: 'Demam',
    plan: 'Paracetamol 3x1',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15'),
    appointment: {
      id: 1,
      status: AppointmentStatus.SELESAI,
      doctor_id: 2,
    },
  } as MedicalRecord,
  {
    id: 2,
    patient_id: 101,
    doctor_id: 2,
    appointment_id: 2,
    subjektif: 'Batuk pilek',
    objektif: 'Tenggorokan merah',
    assessment: 'ISPA',
    plan: 'Antibiotik',
    created_at: new Date('2024-01-16'),
    updated_at: new Date('2024-01-16'),
    appointment: {
      id: 2,
      status: AppointmentStatus.SELESAI,
      doctor_id: 2,
    },
  } as MedicalRecord,
];

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordSearchService', () => {
  let service: MedicalRecordSearchService;
  let repository: Repository<MedicalRecord>;
  let authService: MedicalRecordAuthorizationService;
  let mockQueryBuilder: any;

  // ============================================================================
  // SETUP AND TEARDOWN
  // ============================================================================
  beforeEach(async () => {
    // Create mock query builder
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2),
      getMany: jest.fn().mockResolvedValue(mockMedicalRecords),
    };

    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const mockAuthService = {
      isKepalaKlinik: jest.fn(),
      isDokter: jest.fn(),
      isStaf: jest.fn(),
      getRoleSummary: jest.fn().mockReturnValue('test-role'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordSearchService,
        {
          provide: getRepositoryToken(MedicalRecord),
          useValue: mockRepository,
        },
        {
          provide: MedicalRecordAuthorizationService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<MedicalRecordSearchService>(MedicalRecordSearchService);
    repository = module.get<Repository<MedicalRecord>>(getRepositoryToken(MedicalRecord));
    authService = module.get<MedicalRecordAuthorizationService>(MedicalRecordAuthorizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // BASIC TESTS
  // ============================================================================
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================================================
  // EXECUTE METHOD TESTS
  // ============================================================================
  describe('execute', () => {
    it('should return paginated medical records with default filters', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);

      const result = await service.execute({}, mockKepalaKlinik);

      expect(result).toEqual({
        data: mockMedicalRecords,
        total: 2,
        page: 1,
        limit: 10,
      });
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('record');
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should apply pagination correctly', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);

      const filters: SearchMedicalRecordDto = {
        page: 2,
        limit: 5,
      };

      await service.execute(filters, mockKepalaKlinik);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('should apply all search filters when provided', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);

      const filters: SearchMedicalRecordDto = {
        patient_id: 100,
        doctor_id: 2,
        appointment_id: 1,
        appointment_status: AppointmentStatus.SELESAI,
        start_date: new Date('2024-01-01').toISOString(),
        end_date: new Date('2024-01-31').toISOString(),
        search: 'demam',
        sort_by: 'created_at',
        sort_order: 'DESC',
      };

      await service.execute(filters, mockKepalaKlinik);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.patient_id = :patientId',
        { patientId: 100 }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.doctor_id = :doctorId',
        { doctorId: 2 }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.appointment_id = :appointmentId',
        { appointmentId: 1 }
      );
    });
  });

  // ============================================================================
  // AUTHORIZATION FILTER TESTS
  // ============================================================================
  describe('Authorization Filters', () => {
    describe('Kepala Klinik', () => {
      it('should not apply any filters for Kepala Klinik', async () => {
        jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);
        jest.spyOn(authService, 'isDokter').mockReturnValue(false);
        jest.spyOn(authService, 'isStaf').mockReturnValue(false);

        await service.execute({}, mockKepalaKlinik);

        // Should not add authorization where clauses
        expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
          expect.stringContaining('doctor_id'),
          expect.anything()
        );
      });
    });

    describe('Dokter', () => {
      it('should filter records by doctor ID', async () => {
        jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
        jest.spyOn(authService, 'isDokter').mockReturnValue(true);
        jest.spyOn(authService, 'isStaf').mockReturnValue(false);

        await service.execute({}, mockDokter);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          '(appointment.doctor_id = :doctorId OR record.doctor_id = :doctorId)',
          { doctorId: mockDokter.id }
        );
      });
    });

    describe('Staf', () => {
      it('should filter out cancelled appointments', async () => {
        jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
        jest.spyOn(authService, 'isDokter').mockReturnValue(false);
        jest.spyOn(authService, 'isStaf').mockReturnValue(true);

        await service.execute({}, mockStaf);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'appointment.status != :cancelled',
          { cancelled: AppointmentStatus.DIBATALKAN }
        );
      });
    });
  });

  // ============================================================================
  // SEARCH FILTERS TESTS
  // ============================================================================
  describe('Search Filters', () => {
    beforeEach(() => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);
    });

    it('should filter by patient_id', async () => {
      await service.execute({ patient_id: 100 }, mockKepalaKlinik);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.patient_id = :patientId',
        { patientId: 100 }
      );
    });

    it('should filter by doctor_id', async () => {
      await service.execute({ doctor_id: 2 }, mockKepalaKlinik);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.doctor_id = :doctorId',
        { doctorId: 2 }
      );
    });

    it('should filter by appointment_id', async () => {
      await service.execute({ appointment_id: 1 }, mockKepalaKlinik);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.appointment_id = :appointmentId',
        { appointmentId: 1 }
      );
    });

    it('should filter by appointment status', async () => {
      await service.execute(
        { appointment_status: AppointmentStatus.SELESAI },
        mockKepalaKlinik
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.status = :status',
        { status: AppointmentStatus.SELESAI }
      );
    });

    it('should filter by start_date', async () => {
      const startDate = new Date('2024-01-01');
      await service.execute({ start_date: startDate }, mockKepalaKlinik);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.created_at >= :startDate',
        { startDate }
      );
    });

    it('should filter by end_date', async () => {
      const endDate = new Date('2024-01-31');
      await service.execute({ end_date: endDate }, mockKepalaKlinik);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.created_at <= :endDate',
        { endDate }
      );
    });

    it('should search in SOAP fields', async () => {
      await service.execute({ search: 'demam' }, mockKepalaKlinik);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('record.subjektif LIKE :search'),
        { search: '%demam%' }
      );
    });
  });

  // ============================================================================
  // SORTING TESTS
  // ============================================================================
  describe('Sorting', () => {
    beforeEach(() => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);
    });

    it('should apply default sorting (created_at DESC)', async () => {
      await service.execute({}, mockKepalaKlinik);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('record.created_at', 'DESC');
    });

    it('should sort by created_at', async () => {
      await service.execute(
        { sort_by: 'created_at', sort_order: 'ASC' },
        mockKepalaKlinik
      );

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('record.created_at', 'ASC');
    });

    it('should sort by updated_at', async () => {
      await service.execute(
        { sort_by: 'updated_at', sort_order: 'DESC' },
        mockKepalaKlinik
      );

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('record.updated_at', 'DESC');
    });

    it('should sort by appointment_date', async () => {
      await service.execute(
        { sort_by: 'appointment_date', sort_order: 'ASC' },
        mockKepalaKlinik
      );

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'appointment.appointment_date',
        'ASC'
      );
    });

    it('should use default sorting for invalid sort field', async () => {
      await service.execute(
        { sort_by: 'invalid_field', sort_order: 'ASC' },
        mockKepalaKlinik
      );

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('record.created_at', 'ASC');
    });
  });

  // ============================================================================
  // PAGINATION TESTS
  // ============================================================================
  describe('Pagination', () => {
    beforeEach(() => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);
    });

    it('should apply default pagination (page 1, limit 10)', async () => {
      await service.execute({}, mockKepalaKlinik);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should calculate skip correctly for page 2', async () => {
      await service.execute({ page: 2, limit: 5 }, mockKepalaKlinik);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('should calculate skip correctly for page 3', async () => {
      await service.execute({ page: 3, limit: 10 }, mockKepalaKlinik);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });

  // ============================================================================
  // FINDALL METHOD TESTS
  // ============================================================================
  describe('findAll', () => {
    it('should return all records without pagination info', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);

      const result = await service.findAll(mockKepalaKlinik);

      expect(result).toEqual(mockMedicalRecords);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should apply authorization filters', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
      jest.spyOn(authService, 'isDokter').mockReturnValue(true);

      await service.findAll(mockDokter);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // QUERY BUILDER TESTS
  // ============================================================================
  describe('buildBaseQuery', () => {
    it('should create query with all necessary relations', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);

      await service.execute({}, mockKepalaKlinik);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('record');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'record.appointment',
        'appointment'
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointment.patient',
        'patient'
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointment.doctor',
        'appointmentDoctor'
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'record.doctor',
        'doctor'
      );
    });
  });

  // ============================================================================
  // LOGGING TESTS
  // ============================================================================
  describe('Logging', () => {
    it('should log search results', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);
      jest.spyOn(authService, 'getRoleSummary').mockReturnValue('Kepala Klinik');
      const loggerSpy = jest.spyOn(service['logger'], 'log');

      await service.execute({}, mockKepalaKlinik);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('searched medical records')
      );
    });
  });
});