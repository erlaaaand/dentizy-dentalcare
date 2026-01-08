// ============================================================================
// IMPORTS
// ============================================================================
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MedicalRecordQueryBuilder } from '../medical-record-query.builder';
import { MedicalRecord } from '../../../../domains/entities/medical-record.entity';
import { User } from '../../../../../users/domains/entities/user.entity';
import { Role, UserRole } from '../../../../../roles/entities/role.entity';
import { AppointmentStatus } from '../../../../../appointments/domains/entities/appointment.entity';

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

const mockUnknownUser: User = {
  id: 4,
  nama_lengkap: 'Unknown User',
  roles: [{ id: 99, name: 'UNKNOWN_ROLE' as any }],
} as User;

const mockRole = (id: number, name: UserRole): Role => ({
  id,
  name,
  description: `${name} role`,
  users: [],
});

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordQueryBuilder', () => {
  let builder: MedicalRecordQueryBuilder;
  let repository: Repository<MedicalRecord>;
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
      withDeleted: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
    };

    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordQueryBuilder,
        {
          provide: getRepositoryToken(MedicalRecord),
          useValue: mockRepository,
        },
      ],
    }).compile();

    builder = module.get<MedicalRecordQueryBuilder>(MedicalRecordQueryBuilder);
    repository = module.get<Repository<MedicalRecord>>(
      getRepositoryToken(MedicalRecord),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // BASIC TESTS
  // ============================================================================
  it('should be defined', () => {
    expect(builder).toBeDefined();
  });

  // ============================================================================
  // CREATE BASE QUERY TESTS
  // ============================================================================
  describe('createBaseQuery', () => {
    it('should create query with all standard relations', () => {
      const query = builder.createBaseQuery();

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('record');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'record.appointment',
        'appointment',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointment.patient',
        'patient',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointment.doctor',
        'appointmentDoctor',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointmentDoctor.roles',
        'doctorRoles',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'record.doctor',
        'doctor',
      );
      expect(query).toBe(mockQueryBuilder);
    });
  });

  // ============================================================================
  // AUTHORIZATION FILTER TESTS
  // ============================================================================
  describe('applyAuthorizationFilter', () => {
    beforeEach(() => {
      mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
      };
    });

    it('should not apply filters for Kepala Klinik', () => {
      const query = builder.applyAuthorizationFilter(
        mockQueryBuilder,
        mockKepalaKlinik,
      );

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(query).toBe(mockQueryBuilder);
    });

    it('should apply doctor filter for Dokter role', () => {
      const query = builder.applyAuthorizationFilter(
        mockQueryBuilder,
        mockDokter,
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(appointment.doctor_id = :userId OR record.doctor_id = :userId)',
        { userId: mockDokter.id },
      );
      expect(query).toBe(mockQueryBuilder);
    });

    it('should apply status filter for Staf role', () => {
      const query = builder.applyAuthorizationFilter(
        mockQueryBuilder,
        mockStaf,
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.status != :cancelled',
        { cancelled: AppointmentStatus.DIBATALKAN },
      );
      expect(query).toBe(mockQueryBuilder);
    });

    it('should deny all for unknown roles', () => {
      const query = builder.applyAuthorizationFilter(
        mockQueryBuilder,
        mockUnknownUser,
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('1 = 0');
      expect(query).toBe(mockQueryBuilder);
    });
  });

  // ============================================================================
  // FILTER TESTS
  // ============================================================================
  describe('Filter Methods', () => {
    beforeEach(() => {
      mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
      };
    });

    describe('filterByPatient', () => {
      it('should add patient filter', () => {
        const query = builder.filterByPatient(mockQueryBuilder, 100);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'record.patient_id = :patientId',
          { patientId: 100 },
        );
        expect(query).toBe(mockQueryBuilder);
      });
    });

    describe('filterByDoctor', () => {
      it('should add doctor filter', () => {
        const query = builder.filterByDoctor(mockQueryBuilder, 200);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'record.doctor_id = :doctorId',
          { doctorId: 200 },
        );
        expect(query).toBe(mockQueryBuilder);
      });
    });

    describe('filterByAppointment', () => {
      it('should add appointment filter', () => {
        const query = builder.filterByAppointment(mockQueryBuilder, 300);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'record.appointment_id = :appointmentId',
          { appointmentId: 300 },
        );
        expect(query).toBe(mockQueryBuilder);
      });
    });

    describe('filterByDateRange', () => {
      it('should add start date filter', () => {
        const startDate = new Date('2024-01-01');
        const query = builder.filterByDateRange(mockQueryBuilder, startDate);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'record.created_at >= :startDate',
          { startDate },
        );
        expect(query).toBe(mockQueryBuilder);
      });

      it('should add end date filter', () => {
        const endDate = new Date('2024-01-31');
        const query = builder.filterByDateRange(
          mockQueryBuilder,
          undefined,
          endDate,
        );

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'record.created_at <= :endDate',
          { endDate },
        );
        expect(query).toBe(mockQueryBuilder);
      });

      it('should add both date filters', () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');
        const query = builder.filterByDateRange(
          mockQueryBuilder,
          startDate,
          endDate,
        );

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'record.created_at >= :startDate',
          { startDate },
        );
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'record.created_at <= :endDate',
          { endDate },
        );
        expect(query).toBe(mockQueryBuilder);
      });

      it('should not add filters when both dates are undefined', () => {
        const query = builder.filterByDateRange(mockQueryBuilder);

        expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
        expect(query).toBe(mockQueryBuilder);
      });
    });

    describe('filterByAppointmentStatus', () => {
      it('should add appointment status filter', () => {
        const query = builder.filterByAppointmentStatus(
          mockQueryBuilder,
          AppointmentStatus.SELESAI,
        );

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'appointment.status = :status',
          { status: AppointmentStatus.SELESAI },
        );
        expect(query).toBe(mockQueryBuilder);
      });
    });

    describe('searchInSOAPFields', () => {
      it('should add SOAP search filter', () => {
        const query = builder.searchInSOAPFields(mockQueryBuilder, 'demam');

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          expect.stringContaining('record.subjektif LIKE :search'),
          { search: '%demam%' },
        );
        expect(query).toBe(mockQueryBuilder);
      });
    });

    describe('filterIncomplete', () => {
      it('should add incomplete records filter', () => {
        const query = builder.filterIncomplete(mockQueryBuilder);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          expect.stringContaining('record.subjektif IS NULL'),
        );
        expect(query).toBe(mockQueryBuilder);
      });
    });

    describe('filterComplete', () => {
      it('should add complete records filter', () => {
        const query = builder.filterComplete(mockQueryBuilder);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          expect.stringContaining('record.subjektif IS NOT NULL'),
        );
        expect(query).toBe(mockQueryBuilder);
      });
    });
  });

  // ============================================================================
  // PAGINATION TESTS
  // ============================================================================
  describe('paginate', () => {
    beforeEach(() => {
      mockQueryBuilder = {
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      };
    });

    it('should apply default pagination', () => {
      const query = builder.paginate(mockQueryBuilder);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(query).toBe(mockQueryBuilder);
    });

    it('should apply custom pagination', () => {
      const query = builder.paginate(mockQueryBuilder, 3, 20);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(40); // (3-1) * 20
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(query).toBe(mockQueryBuilder);
    });

    it('should calculate skip for page 1', () => {
      const query = builder.paginate(mockQueryBuilder, 1, 15);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(15);
    });

    it('should calculate skip for page 5', () => {
      const query = builder.paginate(mockQueryBuilder, 5, 10);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(40);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });

  // ============================================================================
  // SORTING TESTS
  // ============================================================================
  describe('sortBy', () => {
    beforeEach(() => {
      mockQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
      };
    });

    it('should apply default sorting', () => {
      const query = builder.sortBy(mockQueryBuilder);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'record.created_at',
        'DESC',
      );
      expect(query).toBe(mockQueryBuilder);
    });

    it('should sort by created_at', () => {
      const query = builder.sortBy(mockQueryBuilder, 'created_at', 'ASC');

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'record.created_at',
        'ASC',
      );
    });

    it('should sort by updated_at', () => {
      const query = builder.sortBy(mockQueryBuilder, 'updated_at', 'DESC');

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'record.updated_at',
        'DESC',
      );
    });

    it('should sort by appointment_date', () => {
      const query = builder.sortBy(mockQueryBuilder, 'appointment_date', 'ASC');

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'appointment.appointment_date',
        'ASC',
      );
    });

    it('should sort by patient_name', () => {
      const query = builder.sortBy(mockQueryBuilder, 'patient_name', 'ASC');

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'patient.nama_lengkap',
        'ASC',
      );
    });

    it('should sort by doctor_name', () => {
      const query = builder.sortBy(mockQueryBuilder, 'doctor_name', 'DESC');

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'doctor.name',
        'DESC',
      );
    });

    it('should use default field for invalid sort field', () => {
      const query = builder.sortBy(mockQueryBuilder, 'invalid_field', 'ASC');

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'record.created_at',
        'ASC',
      );
    });
  });

  // ============================================================================
  // DELETED RECORDS TESTS
  // ============================================================================
  describe('Deleted Records', () => {
    beforeEach(() => {
      mockQueryBuilder = {
        withDeleted: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
      };
    });

    describe('withDeleted', () => {
      it('should include soft-deleted records', () => {
        const query = builder.withDeleted(mockQueryBuilder);

        expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
        expect(query).toBe(mockQueryBuilder);
      });
    });

    describe('onlyDeleted', () => {
      it('should filter only deleted records', () => {
        const query = builder.onlyDeleted(mockQueryBuilder);

        expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'record.deleted_at IS NOT NULL',
        );
        expect(query).toBe(mockQueryBuilder);
      });
    });
  });

  // ============================================================================
  // BUILD FIND ALL QUERY TESTS
  // ============================================================================
  describe('buildFindAllQuery', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      };
      (repository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should build query with default settings for Kepala Klinik', () => {
      const query = builder.buildFindAllQuery(mockKepalaKlinik);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('record');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'record.created_at',
        'DESC',
      );
      expect(query).toBe(mockQueryBuilder);
    });

    it('should apply authorization for Dokter', () => {
      const query = builder.buildFindAllQuery(mockDokter);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('doctor_id = :userId'),
        expect.anything(),
      );
    });

    it('should apply all filters when provided', () => {
      const filters = {
        patientId: 100,
        doctorId: 200,
        appointmentId: 300,
        search: 'demam',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: AppointmentStatus.SELESAI,
        page: 2,
        limit: 20,
        sortBy: 'updated_at',
        sortOrder: 'ASC' as const,
      };

      const query = builder.buildFindAllQuery(mockKepalaKlinik, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.patient_id = :patientId',
        { patientId: 100 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.doctor_id = :doctorId',
        { doctorId: 200 },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'record.updated_at',
        'ASC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('should apply patient filter only', () => {
      const query = builder.buildFindAllQuery(mockKepalaKlinik, {
        patientId: 100,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.patient_id = :patientId',
        { patientId: 100 },
      );
    });

    it('should apply doctor filter only', () => {
      const query = builder.buildFindAllQuery(mockKepalaKlinik, {
        doctorId: 200,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.doctor_id = :doctorId',
        { doctorId: 200 },
      );
    });

    it('should apply appointment filter only', () => {
      const query = builder.buildFindAllQuery(mockKepalaKlinik, {
        appointmentId: 300,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.appointment_id = :appointmentId',
        { appointmentId: 300 },
      );
    });

    it('should apply search filter only', () => {
      const query = builder.buildFindAllQuery(mockKepalaKlinik, {
        search: 'batuk',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('record.subjektif LIKE :search'),
        { search: '%batuk%' },
      );
    });

    it('should apply date range filters', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const query = builder.buildFindAllQuery(mockKepalaKlinik, {
        startDate,
        endDate,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.created_at >= :startDate',
        { startDate },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.created_at <= :endDate',
        { endDate },
      );
    });

    it('should apply status filter', () => {
      const query = builder.buildFindAllQuery(mockKepalaKlinik, {
        status: AppointmentStatus.SELESAI,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.status = :status',
        { status: AppointmentStatus.SELESAI },
      );
    });

    it('should apply custom sorting', () => {
      const query = builder.buildFindAllQuery(mockKepalaKlinik, {
        sortBy: 'patient_name',
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'patient.nama_lengkap',
        'ASC',
      );
    });

    it('should apply pagination when provided', () => {
      const query = builder.buildFindAllQuery(mockKepalaKlinik, {
        page: 3,
        limit: 15,
      });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(30);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(15);
    });

    it('should not apply pagination when not provided', () => {
      const query = builder.buildFindAllQuery(mockKepalaKlinik, {});

      expect(mockQueryBuilder.skip).not.toHaveBeenCalled();
      expect(mockQueryBuilder.take).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('Edge Cases', () => {
    beforeEach(() => {
      mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      };
    });

    it('should handle zero patient ID', () => {
      const query = builder.filterByPatient(mockQueryBuilder, 0);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.patient_id = :patientId',
        { patientId: 0 },
      );
    });

    it('should handle empty search term', () => {
      const query = builder.searchInSOAPFields(mockQueryBuilder, '');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.anything(),
        { search: '%%' },
      );
    });

    it('should handle page 1 pagination', () => {
      const query = builder.paginate(mockQueryBuilder, 1, 10);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should handle large limit', () => {
      const query = builder.paginate(mockQueryBuilder, 1, 1000);

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(1000);
    });

    it('should handle multiple roles user', () => {
      const multiRoleUser: User = {
        ...mockDokter,
        roles: [mockRole(2, UserRole.DOKTER), mockRole(3, UserRole.STAF)],
      };

      builder.applyAuthorizationFilter(mockQueryBuilder, multiRoleUser);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(appointment.doctor_id = :userId OR record.doctor_id = :userId)',
        { userId: multiRoleUser.id },
      );
    });
  });

  // ============================================================================
  // CHAINING TESTS
  // ============================================================================
  describe('Method Chaining', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      };
      (repository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should allow chaining multiple filters', () => {
      let query = builder.createBaseQuery();
      query = builder.filterByPatient(query, 100);
      query = builder.filterByDoctor(query, 200);
      query = builder.sortBy(query, 'created_at', 'DESC');
      query = builder.paginate(query, 1, 10);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
      expect(mockQueryBuilder.skip).toHaveBeenCalled();
      expect(mockQueryBuilder.take).toHaveBeenCalled();
    });
  });
});
