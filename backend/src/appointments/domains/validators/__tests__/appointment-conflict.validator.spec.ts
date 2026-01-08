import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { QueryRunner, SelectQueryBuilder } from 'typeorm';
import { AppointmentConflictValidator } from '../appointment-conflict.validator';
import {
  Appointment,
  AppointmentStatus,
} from './../../entities/appointment.entity';

describe('AppointmentConflictValidator', () => {
  let validator: AppointmentConflictValidator;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Appointment>>;

  beforeEach(async () => {
    // Mock QueryBuilder
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    } as any;

    // Mock QueryRunner
    mockQueryRunner = {
      manager: {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentConflictValidator],
    }).compile();

    validator = module.get<AppointmentConflictValidator>(
      AppointmentConflictValidator,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  describe('validateNoConflict', () => {
    const doctorId = 1;
    const tanggalJanji = new Date('2024-11-20');
    const jamJanji = '10:00:00';
    const bufferStart = '09:30:00';
    const bufferEnd = '10:30:00';

    it('should pass when no conflicting appointment exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        validator.validateNoConflict(
          mockQueryRunner,
          doctorId,
          tanggalJanji,
          jamJanji,
          bufferStart,
          bufferEnd,
        ),
      ).resolves.not.toThrow();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'appointment.doctor_id = :doctorId',
        { doctorId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.tanggal_janji = :tanggalJanji',
        { tanggalJanji },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.status = :status',
        { status: AppointmentStatus.DIJADWALKAN },
      );
      expect(mockQueryBuilder.setLock).toHaveBeenCalledWith(
        'pessimistic_write',
      );
    });

    it('should throw ConflictException when conflicting appointment exists', async () => {
      const conflictingAppointment: Partial<Appointment> = {
        id: 1,
        doctor_id: doctorId,
        tanggal_janji: tanggalJanji,
        jam_janji: '10:15:00',
        status: AppointmentStatus.DIJADWALKAN,
      };

      mockQueryBuilder.getOne.mockResolvedValue(
        conflictingAppointment as Appointment,
      );

      await expect(
        validator.validateNoConflict(
          mockQueryRunner,
          doctorId,
          tanggalJanji,
          jamJanji,
          bufferStart,
          bufferEnd,
        ),
      ).rejects.toThrow(ConflictException);

      await expect(
        validator.validateNoConflict(
          mockQueryRunner,
          doctorId,
          tanggalJanji,
          jamJanji,
          bufferStart,
          bufferEnd,
        ),
      ).rejects.toThrow(
        /Dokter sudah memiliki janji temu di waktu yang berdekatan/,
      );
    });

    it('should include conflicting time in error message', async () => {
      const conflictTime = '10:20:00';
      const conflictingAppointment: Partial<Appointment> = {
        id: 2,
        jam_janji: conflictTime,
      };

      mockQueryBuilder.getOne.mockResolvedValue(
        conflictingAppointment as Appointment,
      );

      await expect(
        validator.validateNoConflict(
          mockQueryRunner,
          doctorId,
          tanggalJanji,
          jamJanji,
          bufferStart,
          bufferEnd,
        ),
      ).rejects.toThrow(new RegExp(conflictTime));
    });

    it('should mention 30 minute buffer in error message', async () => {
      const conflictingAppointment: Partial<Appointment> = {
        id: 3,
        jam_janji: '10:15:00',
      };

      mockQueryBuilder.getOne.mockResolvedValue(
        conflictingAppointment as Appointment,
      );

      await expect(
        validator.validateNoConflict(
          mockQueryRunner,
          doctorId,
          tanggalJanji,
          jamJanji,
          bufferStart,
          bufferEnd,
        ),
      ).rejects.toThrow(/minimal 30 menit/);
    });

    it('should use pessimistic write lock', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await validator.validateNoConflict(
        mockQueryRunner,
        doctorId,
        tanggalJanji,
        jamJanji,
        bufferStart,
        bufferEnd,
      );

      expect(mockQueryBuilder.setLock).toHaveBeenCalledWith(
        'pessimistic_write',
      );
    });

    it('should filter by DIJADWALKAN status only', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await validator.validateNoConflict(
        mockQueryRunner,
        doctorId,
        tanggalJanji,
        jamJanji,
        bufferStart,
        bufferEnd,
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.status = :status',
        { status: AppointmentStatus.DIJADWALKAN },
      );
    });
  });

  describe('validateNoConflictForUpdate', () => {
    const appointmentId = 5;
    const doctorId = 1;
    const tanggalJanji = new Date('2024-11-20');
    const jamJanji = '14:00:00';
    const bufferStart = '13:30:00';
    const bufferEnd = '14:30:00';

    it('should pass when no conflicting appointment exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        validator.validateNoConflictForUpdate(
          mockQueryRunner,
          appointmentId,
          doctorId,
          tanggalJanji,
          jamJanji,
          bufferStart,
          bufferEnd,
        ),
      ).resolves.not.toThrow();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'appointment.id != :appointmentId',
        { appointmentId },
      );
    });

    it('should exclude the appointment being updated', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await validator.validateNoConflictForUpdate(
        mockQueryRunner,
        appointmentId,
        doctorId,
        tanggalJanji,
        jamJanji,
        bufferStart,
        bufferEnd,
      );

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'appointment.id != :appointmentId',
        { appointmentId },
      );
    });

    it('should throw ConflictException when other appointment conflicts', async () => {
      const conflictingAppointment: Partial<Appointment> = {
        id: 99, // Different from appointmentId
        doctor_id: doctorId,
        jam_janji: '14:10:00',
      };

      mockQueryBuilder.getOne.mockResolvedValue(
        conflictingAppointment as Appointment,
      );

      await expect(
        validator.validateNoConflictForUpdate(
          mockQueryRunner,
          appointmentId,
          doctorId,
          tanggalJanji,
          jamJanji,
          bufferStart,
          bufferEnd,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should include all necessary query conditions', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await validator.validateNoConflictForUpdate(
        mockQueryRunner,
        appointmentId,
        doctorId,
        tanggalJanji,
        jamJanji,
        bufferStart,
        bufferEnd,
      );

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.doctor_id = :doctorId',
        { doctorId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.tanggal_janji = :tanggalJanji',
        { tanggalJanji },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.status = :status',
        { status: AppointmentStatus.DIJADWALKAN },
      );
    });

    it('should use pessimistic write lock for update', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await validator.validateNoConflictForUpdate(
        mockQueryRunner,
        appointmentId,
        doctorId,
        tanggalJanji,
        jamJanji,
        bufferStart,
        bufferEnd,
      );

      expect(mockQueryBuilder.setLock).toHaveBeenCalledWith(
        'pessimistic_write',
      );
    });
  });

  describe('edge cases', () => {
    const doctorId = 1;
    const tanggalJanji = new Date('2024-11-20');
    const jamJanji = '10:00:00';
    const bufferStart = '09:30:00';
    const bufferEnd = '10:30:00';

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockQueryBuilder.getOne.mockRejectedValue(dbError);

      await expect(
        validator.validateNoConflict(
          mockQueryRunner,
          doctorId,
          tanggalJanji,
          jamJanji,
          bufferStart,
          bufferEnd,
        ),
      ).rejects.toThrow(dbError);
    });

    it('should handle different buffer windows correctly', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Test with different buffer times
      await validator.validateNoConflict(
        mockQueryRunner,
        doctorId,
        tanggalJanji,
        '08:00:00',
        '07:30:00',
        '08:30:00',
      );

      await validator.validateNoConflict(
        mockQueryRunner,
        doctorId,
        tanggalJanji,
        '16:00:00',
        '15:30:00',
        '16:30:00',
      );

      expect(mockQueryBuilder.getOne).toHaveBeenCalledTimes(2);
    });

    it('should handle same doctor different dates as no conflict', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const date1 = new Date('2024-11-20');
      const date2 = new Date('2024-11-21');

      await validator.validateNoConflict(
        mockQueryRunner,
        doctorId,
        date1,
        jamJanji,
        bufferStart,
        bufferEnd,
      );

      await validator.validateNoConflictForUpdate(
        mockQueryRunner,
        1,
        doctorId,
        date2,
        jamJanji,
        bufferStart,
        bufferEnd,
      );

      // Should query twice with different dates
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.tanggal_janji = :tanggalJanji',
        expect.any(Object),
      );
    });

    it('should work with different doctor IDs', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await validator.validateNoConflict(
        mockQueryRunner,
        1,
        tanggalJanji,
        jamJanji,
        bufferStart,
        bufferEnd,
      );

      await validator.validateNoConflict(
        mockQueryRunner,
        2,
        tanggalJanji,
        jamJanji,
        bufferStart,
        bufferEnd,
      );

      expect(mockQueryBuilder.where).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration scenarios', () => {
    it('should validate complete conflict check flow', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Scenario: Creating appointment at 10:00
      await expect(
        validator.validateNoConflict(
          mockQueryRunner,
          1,
          new Date('2024-11-20'),
          '10:00:00',
          '09:30:00',
          '10:30:00',
        ),
      ).resolves.not.toThrow();

      // Verify all query methods were called
      expect(mockQueryRunner.manager.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.setLock).toHaveBeenCalled();
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });
});
