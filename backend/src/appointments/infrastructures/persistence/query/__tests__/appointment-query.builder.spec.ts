import { Test, TestingModule } from '@nestjs/testing';
import { SelectQueryBuilder } from 'typeorm';
import { AppointmentQueryBuilder } from '../appointment-query.builder';
import { AppointmentValidator } from '../../../../domains/validators/appointment.validator';
import {
  Appointment,
  AppointmentStatus,
} from '../../../../domains/entities/appointment.entity';
import { User } from '../../../../../users/domains/entities/user.entity';
import { FindAppointmentsQueryDto } from '../../../../applications/dto/find-appointments-query.dto';
import { UserRole } from '../../../../../roles/entities/role.entity';

describe('AppointmentQueryBuilder', () => {
  let queryBuilder: AppointmentQueryBuilder;
  let appointmentValidator: jest.Mocked<AppointmentValidator>;
  let mockQuery: jest.Mocked<SelectQueryBuilder<Appointment>>;
  let mockUser: User; // Deklarasi 'let' di sini

  beforeEach(async () => {
    const mockAppointmentValidator = {
      isDoctorOnly: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentQueryBuilder,
        {
          provide: AppointmentValidator,
          useValue: mockAppointmentValidator,
        },
      ],
    }).compile();

    queryBuilder = module.get<AppointmentQueryBuilder>(AppointmentQueryBuilder);
    appointmentValidator = module.get(AppointmentValidator);

    // FIX 1: Assign ke 'mockUser' yang di-scope atas (tanpa 'const')
    mockUser = {
      id: 1,
      nama_lengkap: 'John Doe',
      username: 'johndoe',
      password: 'hashedpassword',
      roles: [
        {
          id: 1,
          name: UserRole.DOKTER,
        },
      ],
    } as User;

    mockQuery = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
    } as any;

    // Best practice: Clear mocks before each test
    jest.clearAllMocks(); // Membersihkan semua mock

    // Atau reset manual jika 'jest.clearAllMocks()' terlalu agresif
    // appointmentValidator.isDoctorOnly.mockClear();
    // mockQuery.leftJoinAndSelect.mockClear();
    // mockQuery.andWhere.mockClear();
    // mockQuery.where.mockClear();
    // mockQuery.orderBy.mockClear();
    // mockQuery.addOrderBy.mockClear();
    // mockQuery.take.mockClear();
    // mockQuery.skip.mockClear();
  });

  describe('buildFindAllQuery', () => {
    it('should build query with basic joins', () => {
      const queryDto: FindAppointmentsQueryDto = {};
      // FIX 2: Hapus baris 'const mockUser:' yang tidak lengkap
      appointmentValidator.isDoctorOnly.mockReturnValue(false);

      // 'mockUser' di sini sekarang akan merujuk ke user dari beforeEach
      queryBuilder.buildFindAllQuery(mockQuery, mockUser, queryDto);

      expect(mockQuery.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointment.patient',
        'patient',
      );
      expect(mockQuery.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointment.doctor',
        'doctor',
      );
      expect(mockQuery.leftJoinAndSelect).toHaveBeenCalledWith(
        'doctor.roles',
        'doctorRoles',
      );
    });

    it('should filter by date when provided', () => {
      const date = '2025-11-20';
      const queryDto: FindAppointmentsQueryDto = { date };
      appointmentValidator.isDoctorOnly.mockReturnValue(false);

      queryBuilder.buildFindAllQuery(mockQuery, mockUser, queryDto);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'appointment.tanggal_janji BETWEEN :startDate AND :endDate',
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      );
    });

    it('should filter by doctor when user is doctor only', () => {
      const queryDto: FindAppointmentsQueryDto = {};
      appointmentValidator.isDoctorOnly.mockReturnValue(true);

      queryBuilder.buildFindAllQuery(mockQuery, mockUser, queryDto);

      // FIX 3: Ubah ekspektasi dari '5' menjadi '1' agar sesuai mockUser.id
      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'appointment.doctor_id = :userId',
        { userId: 1 },
      );
    });

    it('should filter by doctorId when user is not doctor and doctorId provided', () => {
      const queryDto: FindAppointmentsQueryDto = { doctorId: 10 };
      appointmentValidator.isDoctorOnly.mockReturnValue(false);

      queryBuilder.buildFindAllQuery(mockQuery, mockUser, queryDto);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'appointment.doctor_id = :doctorId',
        { doctorId: 10 },
      );
    });

    it('should filter by status when provided', () => {
      const queryDto: FindAppointmentsQueryDto = {
        status: AppointmentStatus.DIJADWALKAN,
      };
      appointmentValidator.isDoctorOnly.mockReturnValue(false);

      queryBuilder.buildFindAllQuery(mockQuery, mockUser, queryDto);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'appointment.status = :status',
        { status: AppointmentStatus.DIJADWALKAN },
      );
    });

    it('should apply default ordering', () => {
      const queryDto: FindAppointmentsQueryDto = {};
      appointmentValidator.isDoctorOnly.mockReturnValue(false);

      queryBuilder.buildFindAllQuery(mockQuery, mockUser, queryDto);

      expect(mockQuery.orderBy).toHaveBeenCalledWith(
        'appointment.tanggal_janji',
        'DESC',
      );
      expect(mockQuery.addOrderBy).toHaveBeenCalledWith(
        'appointment.jam_janji',
        'ASC',
      );
    });

    it('should apply default pagination', () => {
      const queryDto: FindAppointmentsQueryDto = {};
      appointmentValidator.isDoctorOnly.mockReturnValue(false);

      queryBuilder.buildFindAllQuery(mockQuery, mockUser, queryDto);

      expect(mockQuery.take).toHaveBeenCalledWith(10);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });

    it('should apply custom pagination', () => {
      const queryDto: FindAppointmentsQueryDto = { page: 3, limit: 20 };
      appointmentValidator.isDoctorOnly.mockReturnValue(false);

      queryBuilder.buildFindAllQuery(mockQuery, mockUser, queryDto);

      expect(mockQuery.take).toHaveBeenCalledWith(20);
      expect(mockQuery.skip).toHaveBeenCalledWith(40); // (3-1) * 20
    });

    it('should combine multiple filters', () => {
      const queryDto: FindAppointmentsQueryDto = {
        date: '2025-11-20',
        status: AppointmentStatus.DIJADWALKAN,
        doctorId: 10,
        page: 2,
        limit: 15,
      };
      appointmentValidator.isDoctorOnly.mockReturnValue(false);

      queryBuilder.buildFindAllQuery(mockQuery, mockUser, queryDto);

      expect(mockQuery.andWhere).toHaveBeenCalledTimes(3); // date, doctor, status
      expect(mockQuery.take).toHaveBeenCalledWith(15);
      expect(mockQuery.skip).toHaveBeenCalledWith(15);
    });
  });

  describe('buildStatisticsQuery', () => {
    it('should build query without filters', () => {
      queryBuilder.buildStatisticsQuery(mockQuery);

      expect(mockQuery.andWhere).not.toHaveBeenCalled();
    });

    it('should filter by doctorId when provided', () => {
      queryBuilder.buildStatisticsQuery(mockQuery, 10);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'appointment.doctor_id = :doctorId',
        { doctorId: 10 },
      );
    });

    it('should filter by date range when provided', () => {
      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-11-30');

      queryBuilder.buildStatisticsQuery(
        mockQuery,
        undefined,
        startDate,
        endDate,
      );

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'appointment.tanggal_janji BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    });

    it('should combine doctorId and date range filters', () => {
      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-11-30');

      queryBuilder.buildStatisticsQuery(mockQuery, 10, startDate, endDate);

      expect(mockQuery.andWhere).toHaveBeenCalledTimes(2);
      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'appointment.doctor_id = :doctorId',
        { doctorId: 10 },
      );
      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'appointment.tanggal_janji BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    });
  });

  describe('buildUpcomingQuery', () => {
    it('should build query with required joins', () => {
      queryBuilder.buildUpcomingQuery(mockQuery, 5);

      expect(mockQuery.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointment.patient',
        'patient',
      );
      expect(mockQuery.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointment.doctor',
        'doctor',
      );
    });

    it('should filter by user ID', () => {
      queryBuilder.buildUpcomingQuery(mockQuery, 5);

      expect(mockQuery.where).toHaveBeenCalledWith(
        'appointment.doctor_id = :userId',
        { userId: 5 },
      );
    });

    it('should filter by scheduled status', () => {
      queryBuilder.buildUpcomingQuery(mockQuery, 5);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'appointment.status = :status',
        { status: AppointmentStatus.DIJADWALKAN },
      );
    });

    it('should filter by future dates', () => {
      queryBuilder.buildUpcomingQuery(mockQuery, 5);

      expect(mockQuery.andWhere).toHaveBeenCalledWith(
        'appointment.tanggal_janji >= :now',
        expect.objectContaining({ now: expect.any(Date) }),
      );
    });

    it('should order by date and time ascending', () => {
      queryBuilder.buildUpcomingQuery(mockQuery, 5);

      expect(mockQuery.orderBy).toHaveBeenCalledWith(
        'appointment.tanggal_janji',
        'ASC',
      );
      expect(mockQuery.addOrderBy).toHaveBeenCalledWith(
        'appointment.jam_janji',
        'ASC',
      );
    });

    it('should apply default limit of 5', () => {
      queryBuilder.buildUpcomingQuery(mockQuery, 5);

      expect(mockQuery.take).toHaveBeenCalledWith(5);
    });

    it('should apply custom limit', () => {
      queryBuilder.buildUpcomingQuery(mockQuery, 5, 10);

      expect(mockQuery.take).toHaveBeenCalledWith(10);
    });

    it('should return query builder for chaining', () => {
      const result = queryBuilder.buildUpcomingQuery(mockQuery, 5);

      expect(result).toBe(mockQuery);
    });
  });
});
