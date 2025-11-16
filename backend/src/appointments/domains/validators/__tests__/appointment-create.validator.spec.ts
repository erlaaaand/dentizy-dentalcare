import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AppointmentCreateValidator } from '../appointment-create.validator';
import { User } from '../../../../users/domains/entities/user.entity';
import { Patient } from '../../../../patients/domains/entities/patient.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

describe('AppointmentCreateValidator', () => {
  let validator: AppointmentCreateValidator;

  // Mock data
  const mockPatient: Patient = {
    id: 1,
    nama_lengkap: 'John Doe',
    nomor_rekam_medis: 'MR001',
  } as Patient;

  const mockDoctorUser: User = {
    id: 2,
    username: 'dr.smith',
    nama_lengkap: 'Dr. Smith',
    roles: [{ id: 1, name: UserRole.DOKTER, description: 'Doctor' }],
  } as User;

  const mockKepalaKlinikUser: User = {
    id: 3,
    username: 'dr.chief',
    nama_lengkap: 'Dr. Chief',
    roles: [{ id: 2, name: UserRole.KEPALA_KLINIK, description: 'Clinic Head' }],
  } as User;

  const mockStaffUser: User = {
    id: 4,
    username: 'staff.admin',
    nama_lengkap: 'Staff Admin',
    roles: [{ id: 3, name: UserRole.STAF, description: 'Staff' }],
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentCreateValidator],
    }).compile();

    validator = module.get<AppointmentCreateValidator>(
      AppointmentCreateValidator
    );
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  describe('validatePatientExists', () => {
    it('should pass when patient exists', () => {
      expect(() =>
        validator.validatePatientExists(mockPatient, 1)
      ).not.toThrow();
    });

    it('should throw NotFoundException when patient is null', () => {
      expect(() => validator.validatePatientExists(null, 999)).toThrow(
        NotFoundException
      );
    });

    it('should throw correct error message with patient ID', () => {
      const patientId = 123;
      try {
        validator.validatePatientExists(null, patientId);
      } catch (error) {
        expect(error.message).toBe(
          `Pasien dengan ID #${patientId} tidak ditemukan`
        );
      }
    });
  });

  describe('validateDoctorExists', () => {
    it('should pass when doctor exists', () => {
      expect(() =>
        validator.validateDoctorExists(mockDoctorUser, 2)
      ).not.toThrow();
    });

    it('should throw NotFoundException when doctor is null', () => {
      expect(() => validator.validateDoctorExists(null, 999)).toThrow(
        NotFoundException
      );
    });

    it('should throw correct error message with doctor ID', () => {
      const doctorId = 456;
      try {
        validator.validateDoctorExists(null, doctorId);
      } catch (error) {
        expect(error.message).toBe(
          `Dokter dengan ID #${doctorId} tidak ditemukan`
        );
      }
    });
  });

  describe('validateDoctorRole', () => {
    it('should pass for user with DOKTER role', () => {
      expect(() =>
        validator.validateDoctorRole(mockDoctorUser, 2)
      ).not.toThrow();
    });

    it('should pass for user with KEPALA_KLINIK role', () => {
      expect(() =>
        validator.validateDoctorRole(mockKepalaKlinikUser, 3)
      ).not.toThrow();
    });

    it('should pass for user with both DOKTER and KEPALA_KLINIK roles', () => {
      const dualRoleUser: User = {
        id: 5,
        username: 'dr.dual',
        nama_lengkap: 'Dr. Dual',
        roles: [
          { id: 1, name: UserRole.DOKTER, description: 'Doctor' },
          { id: 2, name: UserRole.KEPALA_KLINIK, description: 'Clinic Head' },
        ],
      } as User;

      expect(() =>
        validator.validateDoctorRole(dualRoleUser, 5)
      ).not.toThrow();
    });

    it('should throw ForbiddenException for user with STAF role only', () => {
      expect(() => validator.validateDoctorRole(mockStaffUser, 4)).toThrow(
        ForbiddenException
      );
    });

    it('should throw correct error message for non-doctor user', () => {
      const userId = 789;
      try {
        validator.validateDoctorRole(mockStaffUser, userId);
      } catch (error) {
        expect(error.message).toBe(
          `User dengan ID #${userId} bukan dokter atau kepala klinik`
        );
      }
    });

    it('should throw ForbiddenException for user with no roles', () => {
      const noRoleUser: User = {
        id: 6,
        username: 'no.role',
        nama_lengkap: 'No Role',
        roles: [
          { id: 1, 
            name: UserRole.DOKTER, 
            description: 'Guest User' },
        ],
      } as User;

      expect(() => validator.validateDoctorRole(noRoleUser, 6)).toThrow(
        ForbiddenException
      );
    });
  });

  describe('validateCreateAppointment', () => {
    it('should pass with valid patient and doctor', () => {
      expect(() =>
        validator.validateCreateAppointment(mockPatient, 1, mockDoctorUser, 2)
      ).not.toThrow();
    });

    it('should pass with valid patient and kepala klinik', () => {
      expect(() =>
        validator.validateCreateAppointment(
          mockPatient,
          1,
          mockKepalaKlinikUser,
          3
        )
      ).not.toThrow();
    });

    it('should throw NotFoundException when patient is null', () => {
      expect(() =>
        validator.validateCreateAppointment(null, 999, mockDoctorUser, 2)
      ).toThrow(NotFoundException);
    });

    it('should throw NotFoundException when doctor is null', () => {
      expect(() =>
        validator.validateCreateAppointment(mockPatient, 1, null, 999)
      ).toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not doctor/kepala klinik', () => {
      expect(() =>
        validator.validateCreateAppointment(mockPatient, 1, mockStaffUser, 4)
      ).toThrow(ForbiddenException);
    });

    it('should throw patient error before doctor error', () => {
      try {
        validator.validateCreateAppointment(null, 1, null, 2);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain('Pasien');
      }
    });

    it('should throw doctor exists error before role error', () => {
      try {
        validator.validateCreateAppointment(mockPatient, 1, null, 2);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain('Dokter');
      }
    });
  });

  describe('integration scenarios', () => {
    it('should validate complete appointment creation flow', () => {
      // Scenario: Valid appointment creation
      const patient = mockPatient;
      const doctor = mockDoctorUser;

      expect(() =>
        validator.validateCreateAppointment(patient, patient.id, doctor, doctor.id)
      ).not.toThrow();
    });

    it('should handle multiple validation errors in order', () => {
      const errors: Error[] = [];

      // Test 1: Null patient
      try {
        validator.validateCreateAppointment(null, 1, mockDoctorUser, 2);
      } catch (error) {
        errors.push(error);
      }

      // Test 2: Null doctor
      try {
        validator.validateCreateAppointment(mockPatient, 1, null, 2);
      } catch (error) {
        errors.push(error);
      }

      // Test 3: Invalid role
      try {
        validator.validateCreateAppointment(mockPatient, 1, mockStaffUser, 4);
      } catch (error) {
        errors.push(error);
      }

      expect(errors).toHaveLength(3);
      expect(errors[0]).toBeInstanceOf(NotFoundException);
      expect(errors[1]).toBeInstanceOf(NotFoundException);
      expect(errors[2]).toBeInstanceOf(ForbiddenException);
    });
  });

  describe('edge cases', () => {
    it('should handle user with undefined roles', () => {
      const userWithUndefinedRoles: User = {
        id: 7,
        username: 'undefined.roles',
        nama_lengkap: 'Undefined Roles',
        roles: undefined as any,
      } as User;

      expect(() =>
        validator.validateDoctorRole(userWithUndefinedRoles, 7)
      ).toThrow(ForbiddenException);
    });

    it('should handle patient with minimum required fields', () => {
      const minimalPatient: Patient = {
        id: 100,
      } as Patient;

      expect(() =>
        validator.validatePatientExists(minimalPatient, 100)
      ).not.toThrow();
    });

    it('should validate with different patient and doctor IDs', () => {
      expect(() =>
        validator.validateCreateAppointment(
          mockPatient,
          10,
          { ...mockDoctorUser, id: 20 },
          20
        )
      ).not.toThrow();
    });
  });
});