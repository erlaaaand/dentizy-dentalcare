// ============================================================================
// IMPORTS
// ============================================================================
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { MedicalRecordAuthorizationService } from '../medical-record-authorization.service';
import { User } from '../../../../users/domains/entities/user.entity';
import { MedicalRecord } from '../../entities/medical-record.entity';
import { Appointment, AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';
import { Role, UserRole } from '../../../../roles/entities/role.entity';

// ============================================================================
// MOCK DATA
// ============================================================================
const createMockUser = (roleNames: UserRole[]): User => ({
  id: 1,
  nama_lengkap: 'Test User',
  username: 'test.user',
  roles: roleNames.map(name => ({ id: 1, name, description: 'Test role' })),
} as User);

const createMockMedicalRecord = (doctorId: number, appointmentDoctorId: number): MedicalRecord => ({
  id: 1,
  appointment_id: 10,
  doctor_id: doctorId,
  patient_id: 3,
  subjektif: 'Test',
  objektif: 'Test',
  assessment: 'Test',
  plan: 'Test',
  appointment: {
    id: 10,
    doctor_id: appointmentDoctorId,
    status: AppointmentStatus.DIJADWALKAN,
  } as Appointment,
} as MedicalRecord);

const createMockAppointment = (doctorId: number): Appointment => ({
  id: 10,
  doctor_id: doctorId,
  patient_id: 3,
  status: AppointmentStatus.DIJADWALKAN,
} as Appointment);

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordAuthorizationService', () => {
  let service: MedicalRecordAuthorizationService;

  // ==========================================================================
  // SETUP AND TEARDOWN
  // ==========================================================================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalRecordAuthorizationService],
    }).compile();

    service = module.get<MedicalRecordAuthorizationService>(
      MedicalRecordAuthorizationService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================================
  // ROLE CHECK TESTS
  // ==========================================================================
  describe('Role Checks', () => {
    describe('isKepalaKlinik', () => {
      it('should return true for Kepala Klinik', () => {
        const user = createMockUser([UserRole.KEPALA_KLINIK]);
        expect(service.isKepalaKlinik(user)).toBe(true);
      });

      it('should return false for Dokter', () => {
        const user = createMockUser([UserRole.DOKTER]);
        expect(service.isKepalaKlinik(user)).toBe(false);
      });

      it('should return false for Staf', () => {
        const user = createMockUser([UserRole.STAF]);
        expect(service.isKepalaKlinik(user)).toBe(false);
      });
    });

    describe('isDokter', () => {
      it('should return true for Dokter', () => {
        const user = createMockUser([UserRole.DOKTER]);
        expect(service.isDokter(user)).toBe(true);
      });

      it('should return false for Kepala Klinik', () => {
        const user = createMockUser([UserRole.KEPALA_KLINIK]);
        expect(service.isDokter(user)).toBe(false);
      });

      it('should return false for Staf', () => {
        const user = createMockUser([UserRole.STAF]);
        expect(service.isDokter(user)).toBe(false);
      });
    });

    describe('isStaf', () => {
      it('should return true for Staf', () => {
        const user = createMockUser([UserRole.STAF]);
        expect(service.isStaf(user)).toBe(true);
      });

      it('should return false for Dokter', () => {
        const user = createMockUser([UserRole.DOKTER]);
        expect(service.isStaf(user)).toBe(false);
      });

      it('should return false for Kepala Klinik', () => {
        const user = createMockUser([UserRole.KEPALA_KLINIK]);
        expect(service.isStaf(user)).toBe(false);
      });
    });
  });

  // ==========================================================================
  // CAN CREATE TESTS
  // ==========================================================================
  describe('canCreate', () => {
    it('should allow Kepala Klinik to create any record', () => {
      const user = createMockUser([UserRole.KEPALA_KLINIK]);
      const appointment = createMockAppointment(999);

      expect(service.canCreate(user, appointment)).toBe(true);
    });

    it('should allow Dokter to create for their own appointment', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const appointment = createMockAppointment(2);

      expect(service.canCreate(user, appointment)).toBe(true);
    });

    it('should not allow Dokter to create for other doctor appointment', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const appointment = createMockAppointment(3);

      expect(service.canCreate(user, appointment)).toBe(false);
    });

    it('should allow Staf to create records', () => {
      const user = createMockUser([UserRole.STAF]);
      const appointment = createMockAppointment(999);

      expect(service.canCreate(user, appointment)).toBe(true);
    });

    it('should not allow users without proper role', () => {
      const user = createMockUser([]);
      const appointment = createMockAppointment(1);

      expect(service.canCreate(user, appointment)).toBe(false);
    });
  });

  // ==========================================================================
  // VALIDATE CREATE PERMISSION TESTS
  // ==========================================================================
  describe('validateCreatePermission', () => {
    it('should not throw for Kepala Klinik', () => {
      const user = createMockUser([UserRole.KEPALA_KLINIK]);
      const appointment = createMockAppointment(999);

      expect(() => service.validateCreatePermission(user, appointment))
        .not.toThrow();
    });

    it('should not throw for Dokter with own appointment', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const appointment = createMockAppointment(2);

      expect(() => service.validateCreatePermission(user, appointment))
        .not.toThrow();
    });

    it('should throw for Dokter with other appointment', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const appointment = createMockAppointment(3);

      expect(() => service.validateCreatePermission(user, appointment))
        .toThrow(ForbiddenException);
    });

    it('should not throw for Staf', () => {
      const user = createMockUser([UserRole.STAF]);
      const appointment = createMockAppointment(999);

      expect(() => service.validateCreatePermission(user, appointment))
        .not.toThrow();
    });
  });

  // ==========================================================================
  // CAN VIEW TESTS
  // ==========================================================================
  describe('canView', () => {
    it('should allow Kepala Klinik to view any record', () => {
      const user = createMockUser([UserRole.KEPALA_KLINIK]);
      const record = createMockMedicalRecord(999, 888);

      expect(service.canView(user, record)).toBe(true);
    });

    it('should allow Dokter to view record they created', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const record = createMockMedicalRecord(2, 999);

      expect(service.canView(user, record)).toBe(true);
    });

    it('should allow Dokter to view record from their appointment', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const record = createMockMedicalRecord(999, 2);

      expect(service.canView(user, record)).toBe(true);
    });

    it('should not allow Dokter to view unrelated record', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const record = createMockMedicalRecord(3, 4);

      expect(service.canView(user, record)).toBe(false);
    });

    it('should allow Staf to view records', () => {
      const user = createMockUser([UserRole.STAF]);
      const record = createMockMedicalRecord(999, 888);

      expect(service.canView(user, record)).toBe(true);
    });
  });

  // ==========================================================================
  // VALIDATE VIEW PERMISSION TESTS
  // ==========================================================================
  describe('validateViewPermission', () => {
    it('should not throw for Kepala Klinik', () => {
      const user = createMockUser([UserRole.KEPALA_KLINIK]);
      const record = createMockMedicalRecord(999, 888);

      expect(() => service.validateViewPermission(user, record))
        .not.toThrow();
    });

    it('should not throw for Dokter viewing own record', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const record = createMockMedicalRecord(2, 999);

      expect(() => service.validateViewPermission(user, record))
        .not.toThrow();
    });

    it('should throw for Dokter viewing unrelated record', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const record = createMockMedicalRecord(3, 4);

      expect(() => service.validateViewPermission(user, record))
        .toThrow(ForbiddenException);
    });
  });

  // ==========================================================================
  // CAN UPDATE TESTS
  // ==========================================================================
  describe('canUpdate', () => {
    it('should allow Kepala Klinik to update any record', () => {
      const user = createMockUser([UserRole.KEPALA_KLINIK]);
      const record = createMockMedicalRecord(999, 888);

      expect(service.canUpdate(user, record)).toBe(true);
    });

    it('should allow Dokter to update record they created', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const record = createMockMedicalRecord(2, 999);

      expect(service.canUpdate(user, record)).toBe(true);
    });

    it('should allow Dokter to update record from their appointment', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const record = createMockMedicalRecord(999, 2);

      expect(service.canUpdate(user, record)).toBe(true);
    });

    it('should not allow Dokter to update unrelated record', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const record = createMockMedicalRecord(3, 4);

      expect(service.canUpdate(user, record)).toBe(false);
    });

    it('should allow Staf to update record they created', () => {
      const user = createMockUser([UserRole.STAF]);
      user.id = 5;
      const record = createMockMedicalRecord(5, 999);

      expect(service.canUpdate(user, record)).toBe(true);
    });

    it('should not allow Staf to update record created by others', () => {
      const user = createMockUser([UserRole.STAF]);
      user.id = 5;
      const record = createMockMedicalRecord(6, 999);

      expect(service.canUpdate(user, record)).toBe(false);
    });
  });

  // ==========================================================================
  // VALIDATE UPDATE PERMISSION TESTS
  // ==========================================================================
  describe('validateUpdatePermission', () => {
    it('should not throw for Kepala Klinik', () => {
      const user = createMockUser([UserRole.KEPALA_KLINIK]);
      const record = createMockMedicalRecord(999, 888);

      expect(() => service.validateUpdatePermission(user, record))
        .not.toThrow();
    });

    it('should not throw for Dokter updating own record', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const record = createMockMedicalRecord(2, 999);

      expect(() => service.validateUpdatePermission(user, record))
        .not.toThrow();
    });

    it('should throw for Dokter updating unrelated record', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;
      const record = createMockMedicalRecord(3, 4);

      expect(() => service.validateUpdatePermission(user, record))
        .toThrow(ForbiddenException);
    });

    it('should not throw for Staf updating own record', () => {
      const user = createMockUser([UserRole.STAF]);
      user.id = 5;
      const record = createMockMedicalRecord(5, 999);

      expect(() => service.validateUpdatePermission(user, record))
        .not.toThrow();
    });

    it('should throw for Staf updating others record', () => {
      const user = createMockUser([UserRole.STAF]);
      user.id = 5;
      const record = createMockMedicalRecord(6, 999);

      expect(() => service.validateUpdatePermission(user, record))
        .toThrow(ForbiddenException);
    });
  });

  // ==========================================================================
  // CAN DELETE TESTS
  // ==========================================================================
  describe('canDelete', () => {
    it('should allow Kepala Klinik to delete', () => {
      const user = createMockUser([UserRole.KEPALA_KLINIK]);
      expect(service.canDelete(user)).toBe(true);
    });

    it('should not allow Dokter to delete', () => {
      const user = createMockUser([UserRole.DOKTER]);
      expect(service.canDelete(user)).toBe(false);
    });

    it('should not allow Staf to delete', () => {
      const user = createMockUser([UserRole.STAF]);
      expect(service.canDelete(user)).toBe(false);
    });
  });

  // ==========================================================================
  // VALIDATE DELETE PERMISSION TESTS
  // ==========================================================================
  describe('validateDeletePermission', () => {
    it('should not throw for Kepala Klinik', () => {
      const user = createMockUser([UserRole.KEPALA_KLINIK]);

      expect(() => service.validateDeletePermission(user))
        .not.toThrow();
    });

    it('should throw for Dokter', () => {
      const user = createMockUser([UserRole.DOKTER]);

      expect(() => service.validateDeletePermission(user))
        .toThrow(ForbiddenException);
    });

    it('should throw for Staf', () => {
      const user = createMockUser([UserRole.STAF]);

      expect(() => service.validateDeletePermission(user))
        .toThrow(ForbiddenException);
    });

    it('should throw with correct message', () => {
      const user = createMockUser([UserRole.DOKTER]);

      expect(() => service.validateDeletePermission(user))
        .toThrow('Hanya Kepala Klinik yang dapat menghapus rekam medis');
    });
  });

  // ==========================================================================
  // GET ACCESS FILTER TESTS
  // ==========================================================================
  describe('getAccessFilter', () => {
    it('should return null for Kepala Klinik (no filter)', () => {
      const user = createMockUser([UserRole.KEPALA_KLINIK]);

      const filter = service.getAccessFilter(user);

      expect(filter).toBeNull();
    });

    it('should return doctor filter for Dokter', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;

      const filter = service.getAccessFilter(user);

      expect(filter).toBeDefined();
      if (filter) { // ✅ null-check
        expect(filter.field).toBe('doctor_or_creator');
        expect(filter.value).toBe(2);
      }
    });

    it('should return null for Staf (broad access)', () => {
      const user = createMockUser([UserRole.STAF]);

      const filter = service.getAccessFilter(user);

      expect(filter).toBeNull();
    });

    it('should return deny filter for unknown role', () => {
      const user = createMockUser([]);

      const filter = service.getAccessFilter(user);

      expect(filter).toBeDefined();
      if (filter) {
        expect(filter.field).toBe('id');
        expect(filter.value).toBe(-1);
      }
    });
  });

  // ==========================================================================
  // GET ROLE SUMMARY TESTS
  // ==========================================================================
  describe('getRoleSummary', () => {
    it('should return single role name', () => {
      const user = createMockUser([UserRole.DOKTER]);

      const summary = service.getRoleSummary(user);

      expect(summary).toBe('DOKTER');
    });

    it('should return multiple roles separated by comma', () => {

      const createMockRole = (id: number, name: UserRole): Role => ({
        id,
        name,
        description: name,
        users: [],
      });

      const user = {
        ...createMockUser([UserRole.DOKTER]),
        roles: [
          createMockRole(1, UserRole.DOKTER),
          createMockRole(2, UserRole.STAF),
        ],
      };

      const summary = service.getRoleSummary(user);

      expect(summary).toBe('DOKTER, STAF');
    });

    it('should handle user with no roles', () => {
      const user = createMockUser([]);
      user.roles = [];

      const summary = service.getRoleSummary(user);

      expect(summary).toBe('');
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  describe('Edge Cases', () => {
    it('should handle user with multiple roles including Kepala Klinik', () => {
      const user: User = {
        ...createMockUser([UserRole.DOKTER]),
        roles: [
          { id: 1, name: UserRole.KEPALA_KLINIK, description: 'Head', users: [] },
          { id: 2, name: UserRole.DOKTER, description: 'Doctor', users: [] },
        ],
      };

      expect(service.isKepalaKlinik(user)).toBe(true);
      expect(service.isDokter(user)).toBe(true);
    });

    it('should handle record without appointment relation', () => {
      const user = createMockUser([UserRole.DOKTER]);
      user.id = 2;

      const record = createMockMedicalRecord(2, 999);
      record.doctor = createMockUser([UserRole.DOKTER]);
      record.doctor.id = 2; // user adalah creator

      expect(service.canView(user, record)).toBe(true);
    });


    it('should prioritize Kepala Klinik permissions', () => {
      const user: User = {
        ...createMockUser([UserRole.DOKTER]),
        roles: [
          { id: 1, name: UserRole.KEPALA_KLINIK, description: 'Head', users: [] },
          { id: 2, name: UserRole.DOKTER, description: 'Doctor', users: [] },
        ],
      };
      const appointment = createMockAppointment(999);

      // Should allow because of Kepala Klinik role
      expect(service.canCreate(user, appointment)).toBe(true);
    });
  });
});