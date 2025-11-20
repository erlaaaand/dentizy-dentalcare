import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppointmentCancellationService } from '../appointment-cancellation.service';
import { AppointmentsRepository } from '../../../infrastructures/persistence/repositories/appointments.repository';
import { AppointmentCancellationValidator } from '../../../domains/validators/appointment-cancellation.validator';
import { AppointmentDomainService } from '../../../domains/services/appointment-domain.service';
import { TransactionManager } from '../../../infrastructures/transactions/transaction.manager';
import { AppointmentCancelledEvent } from '../../../infrastructures/events/';
import { Appointment } from '../../../domains/entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { AppointmentStatus } from '../../../domains/entities/appointment.entity';
import { UserRole } from '../../../../roles/entities/role.entity';
import { QueryRunner } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

// --- Mock Data ---

const mockUser: User = {
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

const mockAppointment: Appointment = {
  id: 1,
  patient_id: 1,
  doctor_id: 2,
  tanggal_janji: new Date('2024-07-01'),
  jam_janji: '10:00:00',
  status: AppointmentStatus.DIJADWALKAN,
  keluhan: 'Sakit gigi',
  created_at: new Date(),
  updated_at: new Date(),
} as Appointment;

const mockCancelledAppointment: Appointment = {
  ...mockAppointment,
  status: AppointmentStatus.DIBATALKAN,
  updated_at: new Date(),
} as Appointment;

// --- Mock Implementations ---

// Membuat mock QueryRunner yang lengkap
const createMockQueryRunner = (): Partial<QueryRunner> => ({
  manager: {
    save: jest.fn(),
    findOne: jest.fn(),
  } as any,
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
});

describe('AppointmentCancellationService', () => {
  let service: AppointmentCancellationService;
  let repository: AppointmentsRepository;
  let cancellationValidator: AppointmentCancellationValidator;
  let domainService: AppointmentDomainService;
  let transactionManager: TransactionManager;
  let eventEmitter: EventEmitter2;
  let mockQueryRunner: Partial<QueryRunner>; // Dibuat satu kali
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Inisialisasi mockQueryRunner di sini
    mockQueryRunner = createMockQueryRunner();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentCancellationService,
        {
          provide: AppointmentsRepository,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner), // Selalu kembalikan mock yang sama
            findByIdInTransaction: jest.fn(),
            updateInTransaction: jest.fn(),
          },
        },
        {
          provide: AppointmentCancellationValidator,
          useValue: {
            validateCancellation: jest.fn(),
          },
        },
        {
          provide: AppointmentDomainService,
          useValue: {
            cancelAppointment: jest.fn(),
          },
        },
        {
          provide: TransactionManager,
          useValue: {
            executeInTransaction: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentCancellationService>(
      AppointmentCancellationService,
    );
    repository = module.get<AppointmentsRepository>(AppointmentsRepository);
    cancellationValidator = module.get<AppointmentCancellationValidator>(
      AppointmentCancellationValidator,
    );
    domainService = module.get<AppointmentDomainService>(
      AppointmentDomainService,
    );
    transactionManager = module.get<TransactionManager>(TransactionManager);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Setup logger spy
    // 'logger' adalah private property, jadi kita akses seperti ini
    loggerSpy = jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();

    // Setup mock TransactionManager yang lebih realistis
    (
      transactionManager.executeInTransaction as jest.Mock
    ).mockImplementation(async (queryRunner, callback) => {
      try {
        const result = await callback(queryRunner);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully cancel an appointment with reason', async () => {
      // Arrange
      const appointmentId = 1;
      const reason = 'Pasien berhalangan hadir';

      (repository.findByIdInTransaction as jest.Mock).mockResolvedValue(
        mockAppointment,
      );
      (cancellationValidator.validateCancellation as jest.Mock).mockImplementation(
        () => {},
      );
      (domainService.cancelAppointment as jest.Mock).mockReturnValue(
        mockCancelledAppointment,
      );
      (repository.updateInTransaction as jest.Mock).mockResolvedValue(
        mockCancelledAppointment,
      );

      // Act
      const result = await service.execute(appointmentId, mockUser, reason);

      // Assert
      // 1. Verifikasi alur transaksi
      expect(repository.createQueryRunner).toHaveBeenCalled();
      expect(transactionManager.executeInTransaction).toHaveBeenCalledWith(
        mockQueryRunner,
        expect.any(Function),
        'cancel-appointment',
      );

      // 2. Verifikasi logika di dalam transaksi
      expect(repository.findByIdInTransaction).toHaveBeenCalledWith(
        mockQueryRunner,
        appointmentId,
      );
      expect(cancellationValidator.validateCancellation).toHaveBeenCalledWith(
        mockAppointment,
        mockUser,
      );
      expect(domainService.cancelAppointment).toHaveBeenCalledWith(
        mockAppointment,
      );
      expect(repository.updateInTransaction).toHaveBeenCalledWith(
        mockQueryRunner,
        mockCancelledAppointment,
      );

      // 3. Verifikasi hasil akhir transaksi (Commit)
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();

      // 4. Verifikasi Event
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'appointment.cancelled',
        expect.objectContaining({
          appointment: mockCancelledAppointment,
          cancelledBy: mockUser.id,
          reason: reason,
        }),
      );

      // 5. Verifikasi Logging
      expect(loggerSpy).toHaveBeenCalledWith(
        `❌ Appointment #${appointmentId} cancelled by user #${mockUser.id}`,
      );

      // 6. Verifikasi Hasil
      expect(result).toEqual(mockCancelledAppointment);
    });

    it('should successfully cancel an appointment without reason', async () => {
      // Arrange
      const appointmentId = 1;

      (repository.findByIdInTransaction as jest.Mock).mockResolvedValue(
        mockAppointment,
      );
      (cancellationValidator.validateCancellation as jest.Mock).mockImplementation(
        () => {},
      );
      (domainService.cancelAppointment as jest.Mock).mockReturnValue(
        mockCancelledAppointment,
      );
      (repository.updateInTransaction as jest.Mock).mockResolvedValue(
        mockCancelledAppointment,
      );

      // Act
      const result = await service.execute(appointmentId, mockUser);

      // Assert
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'appointment.cancelled',
        expect.objectContaining({
          appointment: mockCancelledAppointment,
          cancelledBy: mockUser.id,
          reason: undefined, // Memastikan reason undefined
        }),
      );
      expect(result).toEqual(mockCancelledAppointment);
    });

    it('should throw error and rollback when appointment not found', async () => {
      // Arrange
      const appointmentId = 999;
      (repository.findByIdInTransaction as jest.Mock).mockResolvedValue(null);
      const expectedError = new NotFoundException(
        `Janji temu dengan ID #${appointmentId} tidak ditemukan`,
      );

      // Act & Assert
      await expect(service.execute(appointmentId, mockUser)).rejects.toThrow(
        expectedError,
      );

      // Verifikasi Transaksi (Rollback)
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();

      // Verifikasi tidak ada logika lanjutan yang dipanggil
      expect(cancellationValidator.validateCancellation).not.toHaveBeenCalled();
      expect(domainService.cancelAppointment).not.toHaveBeenCalled();
      expect(repository.updateInTransaction).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();

      // Verifikasi Error Logging
      expect(service['logger'].error).toHaveBeenCalledWith(
        `❌ Error cancelling appointment ID ${appointmentId}:`,
        expect.any(String), // Stack trace
      );
    });

    it('should throw error and rollback when cancellation validation fails', async () => {
      // Arrange
      const appointmentId = 1;
      const validationError = new Error('Appointment cannot be cancelled');
      (repository.findByIdInTransaction as jest.Mock).mockResolvedValue(
        mockAppointment,
      );
      (
        cancellationValidator.validateCancellation as jest.Mock
      ).mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(service.execute(appointmentId, mockUser)).rejects.toThrow(
        validationError,
      );

      // Verifikasi Transaksi (Rollback)
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();

      // Verifikasi tidak ada logika lanjutan yang dipanggil
      expect(domainService.cancelAppointment).not.toHaveBeenCalled();
      expect(repository.updateInTransaction).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();

      // Verifikasi Error Logging
      expect(service['logger'].error).toHaveBeenCalledWith(
        `❌ Error cancelling appointment ID ${appointmentId}:`,
        expect.any(String),
      );
    });

    it('should throw error and rollback when database update fails', async () => {
      // Arrange
      const appointmentId = 1;
      const databaseError = new Error('Database connection failed');

      (repository.findByIdInTransaction as jest.Mock).mockResolvedValue(
        mockAppointment,
      );
      (cancellationValidator.validateCancellation as jest.Mock).mockImplementation(
        () => {},
      );
      (domainService.cancelAppointment as jest.Mock).mockReturnValue(
        mockCancelledAppointment,
      );
      (repository.updateInTransaction as jest.Mock).mockRejectedValue(
        databaseError,
      );

      // Act & Assert
      await expect(service.execute(appointmentId, mockUser)).rejects.toThrow(
        databaseError,
      );

      // Verifikasi Transaksi (Rollback)
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();

      // Verifikasi Event tidak terkirim
      expect(eventEmitter.emit).not.toHaveBeenCalled();

      // Verifikasi Error Logging
      expect(service['logger'].error).toHaveBeenCalledWith(
        `❌ Error cancelling appointment ID ${appointmentId}:`,
        expect.any(String),
      );
    });
  });
});