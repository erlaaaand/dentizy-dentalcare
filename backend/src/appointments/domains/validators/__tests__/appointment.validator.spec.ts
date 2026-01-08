import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentValidator } from '../appointment.validator';
import {
  Appointment,
  AppointmentStatus,
} from '../../entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';
import { MedicalRecord } from '../../../../medical_records/domains/entities/medical-record.entity';

describe('AppointmentValidator', () => {
  let validator: AppointmentValidator;

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

  const mockDualRole: User = {
    id: 3,
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

  const mockStaff: User = {
    id: 4,
    username: 'staff',
    nama_lengkap: 'Staff',
    roles: [{ id: 3, name: UserRole.STAF, description: 'Staff' } as any],
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentValidator],
    }).compile();

    validator = module.get<AppointmentValidator>(AppointmentValidator);
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  describe('validateAppointmentExists', () => {
    it('should pass when appointment exists', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIJADWALKAN,
      } as Appointment;

      expect(() =>
        validator.validateAppointmentExists(appointment, 1),
      ).not.toThrow();
    });

    it('should throw NotFoundException when appointment is null', () => {
      expect(() => validator.validateAppointmentExists(null, 999)).toThrow(
        NotFoundException,
      );
    });

    it('should include appointment ID in error message', () => {
      const id = 123;
      try {
        validator.validateAppointmentExists(null, id);
      } catch (error) {
        expect(error.message).toBe(
          `Janji temu dengan ID #${id} tidak ditemukan`,
        );
      }
    });
  });

  describe('validateViewAuthorization', () => {
    it('should pass when Kepala Klinik views any appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 99,
      } as Appointment;

      expect(() =>
        validator.validateViewAuthorization(appointment, mockKepalaKlinik),
      ).not.toThrow();
    });

    it('should pass when doctor views own appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 1,
      } as Appointment;

      expect(() =>
        validator.validateViewAuthorization(appointment, mockDoctor),
      ).not.toThrow();
    });

    it('should throw ForbiddenException when doctor views other appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 99,
      } as Appointment;

      expect(() =>
        validator.validateViewAuthorization(appointment, mockDoctor),
      ).toThrow(ForbiddenException);

      expect(() =>
        validator.validateViewAuthorization(appointment, mockDoctor),
      ).toThrow('Anda tidak memiliki akses ke janji temu ini');
    });

    it('should pass for dual role user viewing any appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 99,
      } as Appointment;

      expect(() =>
        validator.validateViewAuthorization(appointment, mockDualRole),
      ).not.toThrow();
    });

    it('should pass for staff viewing any appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 99,
      } as Appointment;

      expect(() =>
        validator.validateViewAuthorization(appointment, mockStaff),
      ).not.toThrow();
    });
  });

  describe('validateStatusForCompletion', () => {
    it('should pass for DIJADWALKAN status', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIJADWALKAN,
      } as Appointment;

      expect(() =>
        validator.validateStatusForCompletion(appointment),
      ).not.toThrow();
    });

    it('should throw ConflictException for SELESAI status', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.SELESAI,
      } as Appointment;

      expect(() => validator.validateStatusForCompletion(appointment)).toThrow(
        ConflictException,
      );

      expect(() => validator.validateStatusForCompletion(appointment)).toThrow(
        /berstatus 'dijadwalkan'/,
      );
    });

    it('should throw ConflictException for DIBATALKAN status', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIBATALKAN,
      } as Appointment;

      expect(() => validator.validateStatusForCompletion(appointment)).toThrow(
        ConflictException,
      );
    });

    it('should include current status in error message', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.SELESAI,
      } as Appointment;

      try {
        validator.validateStatusForCompletion(appointment);
      } catch (error) {
        expect(error.message).toContain(AppointmentStatus.SELESAI);
      }
    });
  });

  describe('validateCompletionAuthorization', () => {
    it('should pass when Kepala Klinik completes any appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 99,
      } as Appointment;

      expect(() =>
        validator.validateCompletionAuthorization(
          appointment,
          mockKepalaKlinik,
        ),
      ).not.toThrow();
    });

    it('should pass when doctor completes own appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 1,
      } as Appointment;

      expect(() =>
        validator.validateCompletionAuthorization(appointment, mockDoctor),
      ).not.toThrow();
    });

    it('should throw ForbiddenException when doctor completes other appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 99,
      } as Appointment;

      expect(() =>
        validator.validateCompletionAuthorization(appointment, mockDoctor),
      ).toThrow(ForbiddenException);

      expect(() =>
        validator.validateCompletionAuthorization(appointment, mockDoctor),
      ).toThrow('Hanya dokter yang menangani yang bisa menyelesaikan');
    });

    it('should pass for dual role user completing any appointment', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 99,
      } as Appointment;

      expect(() =>
        validator.validateCompletionAuthorization(appointment, mockDualRole),
      ).not.toThrow();
    });
  });

  describe('validateStatusForUpdate', () => {
    it('should pass for DIJADWALKAN status', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIJADWALKAN,
      } as Appointment;

      expect(() =>
        validator.validateStatusForUpdate(appointment),
      ).not.toThrow();
    });

    it('should throw ConflictException for SELESAI status', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.SELESAI,
      } as Appointment;

      expect(() => validator.validateStatusForUpdate(appointment)).toThrow(
        ConflictException,
      );

      expect(() => validator.validateStatusForUpdate(appointment)).toThrow(
        'Tidak bisa mengubah janji temu yang sudah selesai',
      );
    });

    it('should throw ConflictException for DIBATALKAN status', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIBATALKAN,
      } as Appointment;

      expect(() => validator.validateStatusForUpdate(appointment)).toThrow(
        ConflictException,
      );

      expect(() => validator.validateStatusForUpdate(appointment)).toThrow(
        'Tidak bisa mengubah janji temu yang sudah dibatalkan',
      );
    });
  });

  describe('validateForDeletion', () => {
    it('should pass when appointment has no medical record', () => {
      const appointment: Appointment = {
        id: 1,
        medical_record: null,
      } as unknown as Appointment;

      expect(() => validator.validateForDeletion(appointment)).not.toThrow();
    });

    it('should pass when medical_record is undefined', () => {
      const appointment: Appointment = {
        id: 1,
        medical_record: undefined,
      } as unknown as Appointment;

      expect(() => validator.validateForDeletion(appointment)).not.toThrow();
    });

    it('should throw ConflictException when appointment has medical record', () => {
      const appointment: Appointment = {
        id: 1,
        medical_record: { id: 100 } as MedicalRecord,
      } as Appointment;

      expect(() => validator.validateForDeletion(appointment)).toThrow(
        ConflictException,
      );

      expect(() => validator.validateForDeletion(appointment)).toThrow(
        'Tidak bisa menghapus janji temu yang sudah memiliki rekam medis',
      );
    });
  });

  describe('isDoctorOnly', () => {
    it('should return true for doctor without Kepala Klinik role', () => {
      const result = validator.isDoctorOnly(mockDoctor);
      expect(result).toBe(true);
    });

    it('should return false for Kepala Klinik', () => {
      const result = validator.isDoctorOnly(mockKepalaKlinik);
      expect(result).toBe(false);
    });

    it('should return false for dual role user', () => {
      const result = validator.isDoctorOnly(mockDualRole);
      expect(result).toBe(false);
    });

    it('should return false for staff', () => {
      const result = validator.isDoctorOnly(mockStaff);
      expect(result).toBe(false);
    });

    it('should return false for user with no roles', () => {
      const noRoleUser: User = {
        id: 5,
        roles: [],
      } as unknown as User;

      const result = validator.isDoctorOnly(noRoleUser);
      expect(result).toBe(false);
    });
  });

  describe('isKepalaKlinik', () => {
    it('should return true for Kepala Klinik', () => {
      const result = validator.isKepalaKlinik(mockKepalaKlinik);
      expect(result).toBe(true);
    });

    it('should return true for dual role user', () => {
      const result = validator.isKepalaKlinik(mockDualRole);
      expect(result).toBe(true);
    });

    it('should return false for doctor only', () => {
      const result = validator.isKepalaKlinik(mockDoctor);
      expect(result).toBe(false);
    });

    it('should return false for staff', () => {
      const result = validator.isKepalaKlinik(mockStaff);
      expect(result).toBe(false);
    });

    it('should return false for user with no roles', () => {
      const noRoleUser: User = {
        id: 5,
        roles: [],
      } as unknown as User;

      const result = validator.isKepalaKlinik(noRoleUser);
      expect(result).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should validate complete appointment lifecycle', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 1,
        status: AppointmentStatus.DIJADWALKAN,
        medical_record: null,
      } as unknown as Appointment;

      // Check existence
      expect(() =>
        validator.validateAppointmentExists(appointment, 1),
      ).not.toThrow();

      // Check view authorization
      expect(() =>
        validator.validateViewAuthorization(appointment, mockDoctor),
      ).not.toThrow();

      // Check can complete
      expect(() =>
        validator.validateStatusForCompletion(appointment),
      ).not.toThrow();

      expect(() =>
        validator.validateCompletionAuthorization(appointment, mockDoctor),
      ).not.toThrow();

      // Check can update
      expect(() =>
        validator.validateStatusForUpdate(appointment),
      ).not.toThrow();

      // Check can delete
      expect(() => validator.validateForDeletion(appointment)).not.toThrow();
    });

    it('should validate Kepala Klinik permissions', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: 99,
        status: AppointmentStatus.DIJADWALKAN,
      } as Appointment;

      expect(() =>
        validator.validateViewAuthorization(appointment, mockKepalaKlinik),
      ).not.toThrow();

      expect(() =>
        validator.validateCompletionAuthorization(
          appointment,
          mockKepalaKlinik,
        ),
      ).not.toThrow();

      expect(validator.isKepalaKlinik(mockKepalaKlinik)).toBe(true);
      expect(validator.isDoctorOnly(mockKepalaKlinik)).toBe(false);
    });

    it('should validate appointment with medical record restrictions', () => {
      const appointmentWithMR: Appointment = {
        id: 1,
        doctor_id: 1,
        status: AppointmentStatus.SELESAI,
        medical_record: { id: 100 } as MedicalRecord,
      } as Appointment;

      // Cannot update
      expect(() =>
        validator.validateStatusForUpdate(appointmentWithMR),
      ).toThrow(ConflictException);

      // Cannot delete
      expect(() => validator.validateForDeletion(appointmentWithMR)).toThrow(
        ConflictException,
      );

      // Cannot complete again
      expect(() =>
        validator.validateStatusForCompletion(appointmentWithMR),
      ).toThrow(ConflictException);
    });
  });

  describe('edge cases', () => {
    it('should handle appointment with undefined doctor_id', () => {
      const appointment: Appointment = {
        id: 1,
        doctor_id: undefined as any,
      } as Appointment;

      expect(() =>
        validator.validateViewAuthorization(appointment, mockDoctor),
      ).toThrow(ForbiddenException);
    });

    it('should handle user with undefined roles', () => {
      const userUndefinedRoles: User = {
        id: 5,
        roles: undefined,
      } as unknown as User;

      expect(validator.isDoctorOnly(userUndefinedRoles)).toBe(false);
      expect(validator.isKepalaKlinik(userUndefinedRoles)).toBe(false);
      ``;
    });

    it('should handle multiple status validations', () => {
      const statuses = [
        AppointmentStatus.DIJADWALKAN,
        AppointmentStatus.SELESAI,
        AppointmentStatus.DIBATALKAN,
      ];

      const results = statuses.map((status) => {
        const appointment: Appointment = { id: 1, status } as Appointment;
        try {
          validator.validateStatusForCompletion(appointment);
          return 'pass';
        } catch {
          return 'fail';
        }
      });

      expect(results).toEqual(['pass', 'fail', 'fail']);
    });
  });
});
