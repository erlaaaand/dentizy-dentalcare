import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { AppointmentCancellationValidator } from '../appointment-cancellation.validator';
import {
  Appointment,
  AppointmentStatus,
} from '../../entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

describe('AppointmentCancellationValidator', () => {
  let validator: AppointmentCancellationValidator;

  // Mock users
  const mockDoctor: User = {
    id: 1,
    username: 'dr.john',
    nama_lengkap: 'Dr. John',
    roles: [{ id: 1, name: UserRole.DOKTER, description: 'Doctor' } as any],
  } as User;

  const mockKepalaKlinik: User = {
    id: 2,
    username: 'dr.chief',
    nama_lengkap: 'Dr. Chief',
    roles: [
      {
        id: 2,
        name: UserRole.KEPALA_KLINIK,
        description: 'Clinic Head',
      } as any,
    ],
  } as User;

  const mockDoctorOther: User = {
    id: 3,
    username: 'dr.smith',
    nama_lengkap: 'Dr. Smith',
    roles: [{ id: 1, name: UserRole.DOKTER, description: 'Doctor' } as any],
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentCancellationValidator],
    }).compile();

    validator = module.get<AppointmentCancellationValidator>(
      AppointmentCancellationValidator,
    );
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  describe('validateStatusForCancellation', () => {
    it('should pass for DIJADWALKAN status', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIJADWALKAN,
      } as Appointment;

      expect(() =>
        validator.validateStatusForCancellation(appointment),
      ).not.toThrow();
    });

    it('should throw ConflictException for SELESAI status', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.SELESAI,
      } as Appointment;

      expect(() =>
        validator.validateStatusForCancellation(appointment),
      ).toThrow(ConflictException);

      expect(() =>
        validator.validateStatusForCancellation(appointment),
      ).toThrow('Janji temu yang sudah selesai tidak bisa dibatalkan');
    });

    it('should throw ConflictException for DIBATALKAN status', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIBATALKAN,
      } as Appointment;

      expect(() =>
        validator.validateStatusForCancellation(appointment),
      ).toThrow(ConflictException);

      expect(() =>
        validator.validateStatusForCancellation(appointment),
      ).toThrow('Janji temu ini sudah dibatalkan sebelumnya');
    });
  });

  describe('validateCancellationTiming', () => {
    it('should pass when more than 24 hours before appointment', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2); // 2 days from now

      const appointment: Appointment = {
        id: 1,
        tanggal_janji: futureDate,
        jam_janji: '10:00:00',
      } as Appointment;

      expect(() =>
        validator.validateCancellationTiming(appointment, mockDoctor),
      ).not.toThrow();
    });

    it('should pass when Kepala Klinik cancels within 24 hours', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(new Date().getHours() + 2); // Less than 24 hours

      const appointment: Appointment = {
        id: 1,
        tanggal_janji: tomorrow,
        jam_janji: tomorrow.toTimeString().split(' ')[0],
      } as Appointment;

      expect(() =>
        validator.validateCancellationTiming(appointment, mockKepalaKlinik),
      ).not.toThrow();
    });

    it('should throw ForbiddenException when doctor cancels within 24 hours', () => {
      const tomorrow = new Date();
      tomorrow.setHours(new Date().getHours() + 10); // Less than 24 hours

      const appointment: Appointment = {
        id: 1,
        tanggal_janji: tomorrow,
        jam_janji: tomorrow.toTimeString().split(' ')[0],
      } as Appointment;

      expect(() =>
        validator.validateCancellationTiming(appointment, mockDoctor),
      ).toThrow(ForbiddenException);

      expect(() =>
        validator.validateCancellationTiming(appointment, mockDoctor),
      ).toThrow(/Pembatalan janji temu kurang dari 24 jam/);
    });

    // Ganti nama tesnya agar lebih jelas
    it('should throw ForbiddenException when just INSIDE 24 hours boundary', () => {
      const exactDate = new Date();
      exactDate.setHours(exactDate.getHours() + 24); // Ini akan menjadi < 24 jam saat divalidasi

      const appointment: Appointment = {
        id: 1,
        tanggal_janji: exactDate,
        jam_janji: exactDate.toTimeString().split(' ')[0],
      } as Appointment;

      // Ubah ekspektasi menjadi .toThrow()
      expect(() =>
        validator.validateCancellationTiming(appointment, mockDoctor),
      ).toThrow(ForbiddenException);
    });

    it('should handle appointment in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const appointment: Appointment = {
        id: 1,
        tanggal_janji: pastDate,
        jam_janji: '10:00:00',
      } as Appointment;

      expect(() =>
        validator.validateCancellationTiming(appointment, mockDoctor),
      ).toThrow(ForbiddenException);
    });

    it('should handle appointment very soon (1 hour)', () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 1);

      const appointment: Appointment = {
        id: 1,
        tanggal_janji: soonDate,
        jam_janji: soonDate.toTimeString().split(' ')[0],
      } as Appointment;

      expect(() =>
        validator.validateCancellationTiming(appointment, mockDoctor),
      ).toThrow(ForbiddenException);
    });
  });

  describe('validateCancellationAuthorization', () => {
    it('should pass when Kepala Klinik cancels any appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 99, // Different doctor
      } as Appointment;

      expect(() =>
        validator.validateCancellationAuthorization(
          appointment,
          mockKepalaKlinik,
        ),
      ).not.toThrow();
    });

    it('should pass when doctor cancels own appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 1, // Same as mockDoctor.id
      } as Appointment;

      expect(() =>
        validator.validateCancellationAuthorization(appointment, mockDoctor),
      ).not.toThrow();
    });

    it('should throw ForbiddenException when doctor cancels other doctor appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 99, // Different doctor
      } as Appointment;

      expect(() =>
        validator.validateCancellationAuthorization(appointment, mockDoctor),
      ).toThrow(ForbiddenException);

      expect(() =>
        validator.validateCancellationAuthorization(appointment, mockDoctor),
      ).toThrow('Anda tidak memiliki akses ke janji temu ini');
    });

    it('should handle user with both DOKTER and KEPALA_KLINIK roles', () => {
      const dualRoleUser: User = {
        id: 4,
        username: 'dr.dual',
        nama_lengkap: 'Dr. Dual',
        roles: [
          { id: 1, name: UserRole.DOKTER, description: 'Doctor' } as any,
          {
            id: 2,
            name: UserRole.KEPALA_KLINIK,
            description: 'Clinic Head',
          } as any,
        ],
      } as User;

      const appointment: Appointment = {
        id: 1,
        doctor_id: 99, // Different doctor
      } as Appointment;

      expect(() =>
        validator.validateCancellationAuthorization(appointment, dualRoleUser),
      ).not.toThrow();
    });
  });

  describe('validateCancellation', () => {
    it('should pass all validations for valid cancellation', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const appointment: Appointment = {
        id: 1,
        doctor_id: 1,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: futureDate,
        jam_janji: '10:00:00',
      } as Appointment;

      expect(() =>
        validator.validateCancellation(appointment, mockDoctor),
      ).not.toThrow();
    });

    it('should throw error for unauthorized access first', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const appointment: Appointment = {
        id: 1,
        doctor_id: 99, // Different doctor
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: futureDate,
        jam_janji: '10:00:00',
      } as Appointment;

      try {
        validator.validateCancellation(appointment, mockDoctor);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toContain('tidak memiliki akses');
      }
    });

    it('should throw error for invalid status', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const appointment: Appointment = {
        id: 1,
        doctor_id: 1,
        status: AppointmentStatus.SELESAI,
        tanggal_janji: futureDate,
        jam_janji: '10:00:00',
      } as Appointment;

      try {
        validator.validateCancellation(appointment, mockDoctor);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toContain('sudah selesai');
      }
    });

    it('should throw error for timing restriction', () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 2);

      const appointment: Appointment = {
        id: 1,
        doctor_id: 1,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: soonDate,
        jam_janji: soonDate.toTimeString().split(' ')[0],
      } as Appointment;

      try {
        validator.validateCancellation(appointment, mockDoctor);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toContain('kurang dari 24 jam');
      }
    });

    it('should allow Kepala Klinik to cancel any appointment anytime', () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 1);

      const appointment: Appointment = {
        id: 1,
        doctor_id: 99, // Different doctor
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: soonDate,
        jam_janji: soonDate.toTimeString().split(' ')[0],
      } as Appointment;

      expect(() =>
        validator.validateCancellation(appointment, mockKepalaKlinik),
      ).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle appointment at midnight', () => {
      const midnightDate = new Date();
      midnightDate.setDate(midnightDate.getDate() + 2);
      midnightDate.setHours(0, 0, 0, 0);

      const appointment: Appointment = {
        id: 1,
        doctor_id: 1,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: midnightDate,
        jam_janji: '00:00:00',
      } as Appointment;

      expect(() =>
        validator.validateCancellation(appointment, mockDoctor),
      ).not.toThrow();
    });

    it('should handle appointment with only minutes in jam_janji', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const appointment: Appointment = {
        id: 1,
        doctor_id: 1,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: futureDate,
        jam_janji: '10:30',
      } as Appointment;

      expect(() =>
        validator.validateCancellation(appointment, mockDoctor),
      ).not.toThrow();
    });

    it('should handle user with empty roles array', () => {
      const noRoleUser: User = {
        id: 5,
        username: 'no.role',
        nama_lengkap: 'No Role',
        roles: [],
      } as unknown as User;

      // roles: [{ id: 1, name: UserRole.DOKTER, description: 'Doctor' }],

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const appointment: Appointment = {
        id: 1,
        doctor_id: 5,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: futureDate,
        jam_janji: '10:00:00',
      } as Appointment;

      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 2);

      const soonAppointment: Appointment = {
        ...appointment,
        tanggal_janji: soonDate,
        jam_janji: soonDate.toTimeString().split(' ')[0],
      };

      expect(() =>
        validator.validateCancellationTiming(soonAppointment, noRoleUser),
      ).toThrow(ForbiddenException);
    });
  });

  describe('integration scenarios', () => {
    it('should validate complete cancellation flow for doctor', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const appointment: Appointment = {
        id: 1,
        doctor_id: 1,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: futureDate,
        jam_janji: '14:00:00',
      } as Appointment;

      // Should pass all validations
      expect(() => {
        validator.validateCancellationAuthorization(appointment, mockDoctor);
        validator.validateStatusForCancellation(appointment);
        validator.validateCancellationTiming(appointment, mockDoctor);
      }).not.toThrow();

      // Or use the comprehensive method
      expect(() =>
        validator.validateCancellation(appointment, mockDoctor),
      ).not.toThrow();
    });

    it('should validate Kepala Klinik emergency cancellation', () => {
      const urgentDate = new Date();
      urgentDate.setHours(urgentDate.getHours() + 1);

      const appointment: Appointment = {
        id: 1,
        doctor_id: 99, // Other doctor
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: urgentDate,
        jam_janji: urgentDate.toTimeString().split(' ')[0],
      } as Appointment;

      expect(() =>
        validator.validateCancellation(appointment, mockKepalaKlinik),
      ).not.toThrow();
    });
  });
});
