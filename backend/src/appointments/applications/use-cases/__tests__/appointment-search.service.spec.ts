// ======================================
// IMPORTS
// ======================================
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AppointmentSearchService } from '../appointment-search.service';
import { AppointmentsRepository } from '../../../infrastructures/persistence/repositories/appointments.repository';
import { AppointmentQueryBuilder } from '../../../infrastructures/persistence/query/appointment-query.builder';
import { User } from '../../../../users/domains/entities/user.entity';
import { FindAppointmentsQueryDto } from '../../dto/find-appointments-query.dto';
import { Appointment } from '../../../domains/entities/appointment.entity';
import { Patient } from '../../../../patients/domains/entities/patient.entity';
import { AppointmentStatus } from '../../../domains/entities/appointment.entity';
import { UserRole } from '../../../../roles/entities/role.entity';
import { Gender } from '../../../../patients/domains/entities/patient.entity';

// ======================================
// MOCK DATA
// ======================================
// ✅ Mock Patient (BUKAN User, hanya untuk relasi di Appointment)
const mockPatient: Patient = {
  id: 1,
  nama_lengkap: 'John Doe',
  tanggal_lahir: new Date('1990-01-01'),
  jenis_kelamin: Gender.MALE,
  alamat: 'Jl. Test No. 123',
  no_hp: '081234567890',
  email: 'john@example.com',
  nik: '1234567890123456',
  created_at: new Date(),
  updated_at: new Date(),
} as Patient;

// ✅ Mock Doctor User (Staff internal - Dokter)
const mockDoctorUser: User = {
  id: 2,
  username: 'dr.smith',
  password: 'hashed_password',
  nama_lengkap: 'Dr. Smith',
  roles: [
    {
      id: 1,
      name: UserRole.DOKTER,
    },
  ],
} as User;

// ✅ Mock Admin/Staff User (Staff internal - Admin)
const mockAdminUser: User = {
  id: 3,
  username: 'admin.user',
  password: 'hashed_password',
  nama_lengkap: 'Admin User',
  roles: [
    {
      id: 3,
      name: UserRole.STAF,
    },
  ],
} as User;

// ✅ Mock Staf User lainnya
const mockStaffUser: User = {
  id: 4,
  username: 'staff.receptionist',
  password: 'hashed_password',
  nama_lengkap: 'Staff Receptionist',
  roles: [
    {
      id: 3,
      name: UserRole.STAF,
    },
  ],
} as User;

const mockAppointment: Appointment = {
  id: 1,
  patient_id: 1,
  doctor_id: 2,
  tanggal_janji: new Date('2024-12-25'),
  jam_janji: '10:00:00',
  status: AppointmentStatus.DIJADWALKAN,
  keluhan: 'Sakit gigi berlubang',
  patient: mockPatient, // ✅ Relasi ke Patient
  doctor: mockDoctorUser, // ✅ Relasi ke Doctor (User)
  created_at: new Date(),
  updated_at: new Date(),
} as Appointment;

const mockQueryDto: FindAppointmentsQueryDto = {
  page: 1,
  limit: 10,
};

// ======================================
// TEST SUITE
// ======================================
describe('AppointmentSearchService', () => {
  let service: AppointmentSearchService;
  let repository: AppointmentsRepository;
  let queryBuilder: AppointmentQueryBuilder;

  // ======================================
  // SETUP AND TEARDOWN
  // ======================================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentSearchService,
        {
          provide: AppointmentsRepository,
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: AppointmentQueryBuilder,
          useValue: {
            buildFindAllQuery: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentSearchService>(AppointmentSearchService);
    repository = module.get<AppointmentsRepository>(AppointmentsRepository);
    queryBuilder = module.get<AppointmentQueryBuilder>(AppointmentQueryBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ======================================
  // EXECUTE METHOD TESTS
  // ======================================
  describe('execute', () => {
    it('should successfully search appointments with pagination for admin user', async () => {
      // Arrange
      const mockQuery = {
        getManyAndCount: jest.fn().mockResolvedValue([[mockAppointment], 1]),
      };
      const mockBaseQuery = {};

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
      jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

      // Act
      const result = await service.execute(mockAdminUser, mockQueryDto);

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('appointment');
      expect(queryBuilder.buildFindAllQuery).toHaveBeenCalledWith(
        mockBaseQuery,
        mockAdminUser,
        mockQueryDto
      );
      expect(mockQuery.getManyAndCount).toHaveBeenCalled();
      expect(result).toEqual({
        data: [mockAppointment],
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should successfully search appointments with custom pagination', async () => {
      // Arrange
      const customQueryDto: FindAppointmentsQueryDto = {
        page: 2,
        limit: 5,
      };
      const mockAppointments = [mockAppointment, mockAppointment];
      const mockQuery = {
        getManyAndCount: jest.fn().mockResolvedValue([mockAppointments, 10]),
      };
      const mockBaseQuery = {};

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
      jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

      // Act
      const result = await service.execute(mockAdminUser, customQueryDto);

      // Assert
      expect(result).toEqual({
        data: mockAppointments,
        count: 10,
        page: 2,
        limit: 5,
        totalPages: 2, // 10 / 5 = 2 pages
      });
    });

    it('should successfully search appointments for doctor user', async () => {
      // Arrange
      const mockQuery = {
        getManyAndCount: jest.fn().mockResolvedValue([[mockAppointment], 1]),
      };
      const mockBaseQuery = {};

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
      jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

      // Act
      const result = await service.execute(mockDoctorUser, mockQueryDto);

      // Assert
      expect(queryBuilder.buildFindAllQuery).toHaveBeenCalledWith(
        mockBaseQuery,
        mockDoctorUser,
        mockQueryDto
      );
      expect(result.data).toHaveLength(1);
    });

    it('should successfully search appointments for staff user', async () => {
      // Arrange
      const mockQuery = {
        getManyAndCount: jest.fn().mockResolvedValue([[mockAppointment], 1]),
      };
      const mockBaseQuery = {};

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
      jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

      // Act
      const result = await service.execute(mockStaffUser, mockQueryDto);

      // Assert
      expect(queryBuilder.buildFindAllQuery).toHaveBeenCalledWith(
        mockBaseQuery,
        mockStaffUser,
        mockQueryDto
      );
      expect(result.data).toHaveLength(1);
    });

    it('should handle empty result set', async () => {
      // Arrange
      const mockQuery = {
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      const mockBaseQuery = {};

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
      jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

      // Act
      const result = await service.execute(mockAdminUser, mockQueryDto);

      // Assert
      expect(result).toEqual({
        data: [],
        count: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('should use default pagination when not provided', async () => {
      // Arrange
      const queryDtoWithoutPagination = {};
      const mockQuery = {
        getManyAndCount: jest.fn().mockResolvedValue([[mockAppointment], 1]),
      };
      const mockBaseQuery = {};

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
      jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

      // Act
      const result = await service.execute(mockAdminUser, queryDtoWithoutPagination as FindAppointmentsQueryDto);

      // Assert
      expect(result).toEqual({
        data: [mockAppointment],
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    // ======================================
    // ERROR HANDLING TESTS
    // ======================================
    describe('Error handling', () => {
      it('should throw BadRequestException when query execution fails', async () => {
        // Arrange
        const databaseError = new Error('Database connection failed');
        const mockQuery = {
          getManyAndCount: jest.fn().mockRejectedValue(databaseError),
        };
        const mockBaseQuery = {};

        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
        jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

        // Act & Assert
        await expect(service.execute(mockAdminUser, mockQueryDto)).rejects.toThrow(BadRequestException);
        await expect(service.execute(mockAdminUser, mockQueryDto)).rejects.toThrow('Gagal mengambil daftar janji temu');
      });

      it('should throw BadRequestException when query builder fails', async () => {
        // Arrange
        const queryBuilderError = new Error('Query builder error');
        
        jest.spyOn(repository, 'createQueryBuilder').mockImplementation(() => {
          throw queryBuilderError;
        });

        // Act & Assert
        await expect(service.execute(mockAdminUser, mockQueryDto)).rejects.toThrow(BadRequestException);
        await expect(service.execute(mockAdminUser, mockQueryDto)).rejects.toThrow('Gagal mengambil daftar janji temu');
      });
    });

    // ======================================
    // QUERY BUILDING TESTS
    // ======================================
    describe('Query building', () => {
      it('should build query with filters for doctorId', async () => {
        // Arrange
        const filteredQueryDto: FindAppointmentsQueryDto = {
          doctorId: 2,
          page: 1,
          limit: 10,
        };
        const mockQuery = {
          getManyAndCount: jest.fn().mockResolvedValue([[mockAppointment], 1]),
        };
        const mockBaseQuery = {};

        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
        const buildQuerySpy = jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

        // Act
        await service.execute(mockAdminUser, filteredQueryDto);

        // Assert
        expect(buildQuerySpy).toHaveBeenCalledWith(
          mockBaseQuery,
          mockAdminUser,
          filteredQueryDto
        );
      });

      it('should build query with filters for date', async () => {
        // Arrange
        const filteredQueryDto: FindAppointmentsQueryDto = {
          date: '2024-12-25',
          page: 1,
          limit: 10,
        };
        const mockQuery = {
          getManyAndCount: jest.fn().mockResolvedValue([[mockAppointment], 1]),
        };
        const mockBaseQuery = {};

        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
        const buildQuerySpy = jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

        // Act
        await service.execute(mockAdminUser, filteredQueryDto);

        // Assert
        expect(buildQuerySpy).toHaveBeenCalledWith(
          mockBaseQuery,
          mockAdminUser,
          filteredQueryDto
        );
      });

      it('should build query with filters for status', async () => {
        // Arrange
        const filteredQueryDto: FindAppointmentsQueryDto = {
          status: AppointmentStatus.DIJADWALKAN,
          page: 1,
          limit: 10,
        };
        const mockQuery = {
          getManyAndCount: jest.fn().mockResolvedValue([[mockAppointment], 1]),
        };
        const mockBaseQuery = {};

        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
        const buildQuerySpy = jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

        // Act
        await service.execute(mockAdminUser, filteredQueryDto);

        // Assert
        expect(buildQuerySpy).toHaveBeenCalledWith(
          mockBaseQuery,
          mockAdminUser,
          filteredQueryDto
        );
      });

      it('should build query with all filters combined', async () => {
        // Arrange
        const filteredQueryDto: FindAppointmentsQueryDto = {
          doctorId: 2,
          date: '2024-12-25',
          status: AppointmentStatus.DIJADWALKAN,
          page: 1,
          limit: 10,
        };
        const mockQuery = {
          getManyAndCount: jest.fn().mockResolvedValue([[mockAppointment], 1]),
        };
        const mockBaseQuery = {};

        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
        const buildQuerySpy = jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

        // Act
        await service.execute(mockAdminUser, filteredQueryDto);

        // Assert
        expect(buildQuerySpy).toHaveBeenCalledWith(
          mockBaseQuery,
          mockAdminUser,
          filteredQueryDto
        );
      });
    });

    // ======================================
    // PAGINATION TESTS
    // ======================================
    describe('Pagination', () => {
      it('should calculate total pages correctly for exact division', async () => {
        // Arrange
        const mockQuery = {
          getManyAndCount: jest.fn().mockResolvedValue([[], 20]),
        };
        const mockBaseQuery = {};

        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
        jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

        // Act
        const result = await service.execute(mockAdminUser, { page: 1, limit: 10 });

        // Assert
        expect(result.totalPages).toBe(2); // 20 / 10 = 2
      });

      it('should calculate total pages correctly for uneven division', async () => {
        // Arrange
        const mockQuery = {
          getManyAndCount: jest.fn().mockResolvedValue([[], 15]),
        };
        const mockBaseQuery = {};

        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
        jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

        // Act
        const result = await service.execute(mockAdminUser, { page: 1, limit: 10 });

        // Assert
        expect(result.totalPages).toBe(2); // 15 / 10 = 1.5 → ceil to 2
      });

      it('should handle zero total count', async () => {
        // Arrange
        const mockQuery = {
          getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        };
        const mockBaseQuery = {};

        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
        jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

        // Act
        const result = await service.execute(mockAdminUser, { page: 1, limit: 10 });

        // Assert
        expect(result.totalPages).toBe(0);
      });
    });

    // ======================================
    // LOGGING TESTS
    // ======================================
    describe('Logging', () => {
      it('should log successful search with count', async () => {
        // Arrange
        const mockQuery = {
          getManyAndCount: jest.fn().mockResolvedValue([[mockAppointment, mockAppointment], 2]),
        };
        const mockBaseQuery = {};
        const loggerSpy = jest.spyOn(service['logger'], 'log');

        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
        jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

        // Act
        await service.execute(mockAdminUser, mockQueryDto);

        // Assert
        expect(loggerSpy).toHaveBeenCalledWith('📋 Retrieved 2/2 appointments');
      });

      it('should log error when search fails', async () => {
        // Arrange
        const databaseError = new Error('Database error');
        const mockQuery = {
          getManyAndCount: jest.fn().mockRejectedValue(databaseError),
        };
        const mockBaseQuery = {};
        const loggerSpy = jest.spyOn(service['logger'], 'error');

        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockBaseQuery as any);
        jest.spyOn(queryBuilder, 'buildFindAllQuery').mockReturnValue(mockQuery as any);

        // Act & Assert
        await expect(service.execute(mockAdminUser, mockQueryDto)).rejects.toThrow(BadRequestException);
        expect(loggerSpy).toHaveBeenCalledWith(
          '❌ Error fetching appointments:',
          expect.any(String)
        );
      });
    });
  });
});