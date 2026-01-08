import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { MedicalRecordAuthorizationValidator } from '../medical-record-authorization.validator';
import { User } from '../../../../users/domains/entities/user.entity';
import { Role, UserRole } from '../../../../roles/entities/role.entity';
import { MedicalRecord } from '../../entities/medical-record.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../../../../appointments/domains/entities/appointment.entity';

describe('MedicalRecordAuthorizationValidator', () => {
  let validator: MedicalRecordAuthorizationValidator;

  // ==================== MOCK DATA ====================
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

  const mockAppointment: Appointment = {
    id: 1,
    patient_id: 1,
    doctor_id: 2,
    status: AppointmentStatus.SELESAI,
  } as Appointment;

  const mockMedicalRecord: MedicalRecord = {
    id: 1,
    appointment_id: 1,
    patient_id: 1,
    doctor_id: 2,
    appointment: mockAppointment,
  } as MedicalRecord;

  // ==================== SETUP AND TEARDOWN ====================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalRecordAuthorizationValidator],
    }).compile();

    validator = module.get<MedicalRecordAuthorizationValidator>(
      MedicalRecordAuthorizationValidator,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== VALIDATE AUTHENTICATED TESTS ====================
  describe('validateAuthenticated', () => {
    it('should pass for authenticated user', () => {
      expect(() => {
        validator.validateAuthenticated(mockDokter);
      }).not.toThrow();
    });

    it('should throw when user is null', () => {
      expect(() => {
        validator.validateAuthenticated(null);
      }).toThrow(UnauthorizedException);
    });

    it('should throw when user has no id', () => {
      const invalidUser = { ...mockDokter, id: null };
      expect(() => {
        validator.validateAuthenticated(invalidUser as unknown as User);
      }).toThrow(UnauthorizedException);
    });

    it('should throw when user has no roles', () => {
      const invalidUser = { ...mockDokter, roles: [] };
      expect(() => {
        validator.validateAuthenticated(invalidUser);
      }).toThrow(UnauthorizedException);
    });

    it('should throw when roles is null', () => {
      const invalidUser = { ...mockDokter, roles: null };
      expect(() => {
        validator.validateAuthenticated(invalidUser as unknown as User);
      }).toThrow(UnauthorizedException);
    });
  });

  // ==================== VALIDATE HAS ROLE TESTS ====================
  describe('validateHasRole', () => {
    it('should pass when user has required role', () => {
      expect(() => {
        validator.validateHasRole(mockDokter, [UserRole.DOKTER]);
      }).not.toThrow();
    });

    it('should pass when user has one of multiple required roles', () => {
      expect(() => {
        validator.validateHasRole(mockDokter, [UserRole.DOKTER, UserRole.STAF]);
      }).not.toThrow();
    });

    it('should throw when user does not have required role', () => {
      expect(() => {
        validator.validateHasRole(mockStaf, [UserRole.DOKTER]);
      }).toThrow(ForbiddenException);
    });

    it('should throw when user has no matching roles', () => {
      expect(() => {
        validator.validateHasRole(mockStaf, [
          UserRole.DOKTER,
          UserRole.KEPALA_KLINIK,
        ]);
      }).toThrow(ForbiddenException);
    });
  });

  // ==================== VALIDATE CAN CREATE TESTS ====================
  describe('validateCanCreate', () => {
    it('should allow Kepala Klinik to create for any appointment', () => {
      expect(() => {
        validator.validateCanCreate(mockKepalaKlinik, mockAppointment);
      }).not.toThrow();
    });

    it('should allow Dokter to create for their own appointment', () => {
      expect(() => {
        validator.validateCanCreate(mockDokter, mockAppointment);
      }).not.toThrow();
    });

    it('should throw when Dokter tries to create for another doctor', () => {
      const otherDoctorAppointment = { ...mockAppointment, doctor_id: 999 };
      expect(() => {
        validator.validateCanCreate(mockDokter, otherDoctorAppointment);
      }).toThrow(ForbiddenException);
    });

    it('should allow Staf to create', () => {
      expect(() => {
        validator.validateCanCreate(mockStaf, mockAppointment);
      }).not.toThrow();
    });

    it('should throw for unknown role', () => {
      const unknownUser = {
        ...mockDokter,
        roles: [
          {
            id: 99,
            name: 'UNKNOWN_ROLE',
          } as unknown as Role,
        ],
      };
      expect(() => {
        validator.validateCanCreate(unknownUser as User, mockAppointment);
      }).toThrow(ForbiddenException);
    });
  });

  // ==================== VALIDATE CAN VIEW TESTS ====================
  describe('validateCanView', () => {
    it('should allow Kepala Klinik to view any record', () => {
      expect(() => {
        validator.validateCanView(mockKepalaKlinik, mockMedicalRecord);
      }).not.toThrow();
    });

    it('should allow Dokter to view their patient records', () => {
      expect(() => {
        validator.validateCanView(mockDokter, mockMedicalRecord);
      }).not.toThrow();
    });

    it('should allow Dokter to view records they created', () => {
      const recordCreatedByDoctor = {
        ...mockMedicalRecord,
        doctor_id: 2,
      } as unknown as MedicalRecord;
      expect(() => {
        validator.validateCanView(mockDokter, recordCreatedByDoctor);
      }).not.toThrow();
    });

    it('should throw when Dokter tries to view other doctor records', () => {
      const otherDoctorRecord = {
        ...mockMedicalRecord,
        doctor_id: 999,
        appointment: { ...mockAppointment, doctor_id: 999 },
      } as unknown as MedicalRecord;
      expect(() => {
        validator.validateCanView(mockDokter, otherDoctorRecord);
      }).toThrow(ForbiddenException);
    });

    it('should allow Staf to view all records', () => {
      expect(() => {
        validator.validateCanView(mockStaf, mockMedicalRecord);
      }).not.toThrow();
    });
  });

  // ==================== VALIDATE CAN UPDATE TESTS ====================
  describe('validateCanUpdate', () => {
    it('should allow Kepala Klinik to update any record', () => {
      expect(() => {
        validator.validateCanUpdate(mockKepalaKlinik, mockMedicalRecord);
      }).not.toThrow();
    });

    it('should allow Dokter to update their own records', () => {
      expect(() => {
        validator.validateCanUpdate(mockDokter, mockMedicalRecord);
      }).not.toThrow();
    });

    it('should throw when Dokter tries to update other doctor records', () => {
      const otherDoctorRecord = {
        ...mockMedicalRecord,
        doctor_id: 999,
        appointment: { ...mockAppointment, doctor_id: 999 },
      } as unknown as MedicalRecord;
      expect(() => {
        validator.validateCanUpdate(mockDokter, otherDoctorRecord);
      }).toThrow(ForbiddenException);
    });

    it('should allow Staf to update records they created', () => {
      const recordCreatedByStaf = {
        ...mockMedicalRecord,
        doctor_id: 3,
      } as unknown as MedicalRecord;
      expect(() => {
        validator.validateCanUpdate(mockStaf, recordCreatedByStaf);
      }).not.toThrow();
    });

    it('should throw when Staf tries to update records they did not create', () => {
      expect(() => {
        validator.validateCanUpdate(mockStaf, mockMedicalRecord);
      }).toThrow(ForbiddenException);
    });
  });

  // ==================== VALIDATE CAN DELETE TESTS ====================
  describe('validateCanDelete', () => {
    it('should allow Kepala Klinik to delete', () => {
      expect(() => {
        validator.validateCanDelete(mockKepalaKlinik);
      }).not.toThrow();
    });

    it('should throw when Dokter tries to delete', () => {
      expect(() => {
        validator.validateCanDelete(mockDokter);
      }).toThrow(ForbiddenException);
    });

    it('should throw when Staf tries to delete', () => {
      expect(() => {
        validator.validateCanDelete(mockStaf);
      }).toThrow(ForbiddenException);
    });
  });

  // ==================== VALIDATE CAN RESTORE TESTS ====================
  describe('validateCanRestore', () => {
    it('should allow Kepala Klinik to restore', () => {
      expect(() => {
        validator.validateCanRestore(mockKepalaKlinik);
      }).not.toThrow();
    });

    it('should throw when Dokter tries to restore', () => {
      expect(() => {
        validator.validateCanRestore(mockDokter);
      }).toThrow(ForbiddenException);
    });

    it('should throw when Staf tries to restore', () => {
      expect(() => {
        validator.validateCanRestore(mockStaf);
      }).toThrow(ForbiddenException);
    });
  });

  // ==================== GET AUTHORIZATION LEVEL TESTS ====================
  describe('getAuthorizationLevel', () => {
    it('should return admin for Kepala Klinik', () => {
      const level = validator.getAuthorizationLevel(mockKepalaKlinik);
      expect(level).toBe('admin');
    });

    it('should return doctor for Dokter', () => {
      const level = validator.getAuthorizationLevel(mockDokter);
      expect(level).toBe('doctor');
    });

    it('should return staff for Staf', () => {
      const level = validator.getAuthorizationLevel(mockStaf);
      expect(level).toBe('staff');
    });

    it('should return none for unknown role', () => {
      const unknownUser = {
        ...mockDokter,
        roles: [{ id: 99, name: 'UNKNOWN' as UserRole }],
      } as unknown as User;
      const level = validator.getAuthorizationLevel(unknownUser);
      expect(level).toBe('none');
    });
  });

  // ==================== GET ALLOWED OPERATIONS TESTS ====================
  describe('getAllowedOperations', () => {
    it('should return all operations for Kepala Klinik', () => {
      const operations = validator.getAllowedOperations(mockKepalaKlinik);
      expect(operations).toContain('create');
      expect(operations).toContain('read');
      expect(operations).toContain('update');
      expect(operations).toContain('delete');
      expect(operations).toContain('restore');
      expect(operations).toContain('hard_delete');
      expect(operations).toContain('bulk');
    });

    it('should return limited operations for Dokter', () => {
      const operations = validator.getAllowedOperations(mockDokter);
      expect(operations).toContain('create');
      expect(operations).toContain('read');
      expect(operations).toContain('update');
      expect(operations).not.toContain('delete');
    });

    it('should return limited operations for Staf', () => {
      const operations = validator.getAllowedOperations(mockStaf);
      expect(operations).toContain('create');
      expect(operations).toContain('read');
      expect(operations).toContain('update');
      expect(operations).not.toContain('delete');
    });

    it('should include update when Dokter owns the record', () => {
      const operations = validator.getAllowedOperations(
        mockDokter,
        mockMedicalRecord,
      );
      expect(operations).toContain('update');
    });

    it('should include update when Staf created the record', () => {
      const recordByStaf = {
        ...mockMedicalRecord,
        doctor_id: 3,
      } as unknown as MedicalRecord;
      const operations = validator.getAllowedOperations(mockStaf, recordByStaf);
      expect(operations).toContain('update');
    });
  });

  // ==================== VALIDATE CAN ACCESS PATIENT RECORDS TESTS ====================
  describe('validateCanAccessPatientRecords', () => {
    it('should allow Kepala Klinik to access any patient', () => {
      expect(() => {
        validator.validateCanAccessPatientRecords(mockKepalaKlinik, 1);
      }).not.toThrow();
    });

    it('should allow Staf to access any patient', () => {
      expect(() => {
        validator.validateCanAccessPatientRecords(mockStaf, 1);
      }).not.toThrow();
    });

    it('should allow Dokter to access patient records', () => {
      expect(() => {
        validator.validateCanAccessPatientRecords(mockDokter, 1);
      }).not.toThrow();
    });
  });

  // ==================== VALIDATE BULK OPERATIONS TESTS ====================
  describe('validateCanPerformBulkOperation', () => {
    it('should allow Kepala Klinik bulk operations', () => {
      expect(() => {
        validator.validateCanPerformBulkOperation(mockKepalaKlinik);
      }).not.toThrow();
    });

    it('should allow Staf bulk operations', () => {
      expect(() => {
        validator.validateCanPerformBulkOperation(mockStaf);
      }).not.toThrow();
    });

    it('should throw when Dokter tries bulk operations', () => {
      expect(() => {
        validator.validateCanPerformBulkOperation(mockDokter);
      }).toThrow(ForbiddenException);
    });
  });

  // ==================== VALIDATE STATISTICS ACCESS TESTS ====================
  describe('validateCanAccessStatistics', () => {
    it('should allow Kepala Klinik to access statistics', () => {
      expect(() => {
        validator.validateCanAccessStatistics(mockKepalaKlinik);
      }).not.toThrow();
    });

    it('should allow Staf to access statistics', () => {
      expect(() => {
        validator.validateCanAccessStatistics(mockStaf);
      }).not.toThrow();
    });

    it('should throw when Dokter tries to access statistics', () => {
      expect(() => {
        validator.validateCanAccessStatistics(mockDokter);
      }).toThrow(ForbiddenException);
    });
  });
});
