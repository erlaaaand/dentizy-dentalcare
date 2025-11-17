// ============================================================================
// IMPORTS
// ============================================================================
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MedicalRecordValidator } from '../medical-record.validator';
import { MedicalRecord } from '../../entities/medical-record.entity';
import { Appointment, AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { Patient } from '../../../../patients/domains/entities/patient.entity';

// ============================================================================
// MOCK DATA
// ============================================================================
const createMockMedicalRecord = (): MedicalRecord => ({
  id: 1,
  appointment_id: 10,
  doctor_id: 2,
  patient_id: 3,
  subjektif: 'Test',
  objektif: 'Test',
  assessment: 'Test',
  plan: 'Test',
  created_at: new Date(),
  updated_at: new Date(),
  appointment: {
    id: 10,
    tanggal_janji: new Date(),
    status: AppointmentStatus.DIJADWALKAN, // atau enum AppointmentStatus.DIJADWALKAN
    patient: { id: 3, nama_lengkap: 'Jane Doe' } as any,
    doctor: { id: 2, nama_lengkap: 'Dr. John' } as any,
  } as Appointment,
  doctor: { id: 2, nama_lengkap: 'Dr. John' } as User,
  patient: { id: 3, nama_lengkap: 'Jane Doe' } as Patient,
} as MedicalRecord);

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordValidator', () => {
  let validator: MedicalRecordValidator;

  // ==========================================================================
  // SETUP AND TEARDOWN
  // ==========================================================================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalRecordValidator],
    }).compile();

    validator = module.get<MedicalRecordValidator>(MedicalRecordValidator);
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  // ==========================================================================
  // VALIDATE ID TESTS
  // ==========================================================================
  describe('validateId', () => {
    it('should pass for valid ID', () => {
      expect(() => validator.validateId(1)).not.toThrow();
      expect(() => validator.validateId(100)).not.toThrow();
      expect(() => validator.validateId(999999)).not.toThrow();
    });

    it('should throw error for ID 0', () => {
      expect(() => validator.validateId(0))
        .toThrow(BadRequestException);
    });

    it('should throw error for negative ID', () => {
      expect(() => validator.validateId(-1))
        .toThrow(BadRequestException);
    });

    it('should throw error for null ID', () => {
      expect(() => validator.validateId(null))
        .toThrow(BadRequestException);
    });

    it('should throw error for undefined ID', () => {
      expect(() => validator.validateId(undefined))
        .toThrow(BadRequestException);
    });

    it('should throw with correct message', () => {
      expect(() => validator.validateId(0))
        .toThrow('ID rekam medis tidak valid');
    });
  });

  // ==========================================================================
  // VALIDATE APPOINTMENT ID TESTS
  // ==========================================================================
  describe('validateAppointmentId', () => {
    it('should pass for valid appointment ID', () => {
      expect(() => validator.validateAppointmentId(1)).not.toThrow();
      expect(() => validator.validateAppointmentId(50)).not.toThrow();
    });

    it('should throw error for ID 0', () => {
      expect(() => validator.validateAppointmentId(0))
        .toThrow(BadRequestException);
    });

    it('should throw error for negative ID', () => {
      expect(() => validator.validateAppointmentId(-5))
        .toThrow(BadRequestException);
    });

    it('should throw error for null', () => {
      expect(() => validator.validateAppointmentId(null))
        .toThrow(BadRequestException);
    });

    it('should throw error for undefined', () => {
      expect(() => validator.validateAppointmentId(undefined))
        .toThrow(BadRequestException);
    });

    it('should throw with correct message', () => {
      expect(() => validator.validateAppointmentId(-1))
        .toThrow('ID janji temu tidak valid');
    });
  });

  // ==========================================================================
  // VALIDATE USER ID TESTS
  // ==========================================================================
  describe('validateUserId', () => {
    it('should pass for valid user ID', () => {
      expect(() => validator.validateUserId(1)).not.toThrow();
      expect(() => validator.validateUserId(1000)).not.toThrow();
    });

    it('should throw error for ID 0', () => {
      expect(() => validator.validateUserId(0))
        .toThrow(BadRequestException);
    });

    it('should throw error for negative ID', () => {
      expect(() => validator.validateUserId(-10))
        .toThrow(BadRequestException);
    });

    it('should throw error for null', () => {
      expect(() => validator.validateUserId(null))
        .toThrow(BadRequestException);
    });

    it('should throw error for undefined', () => {
      expect(() => validator.validateUserId(undefined))
        .toThrow(BadRequestException);
    });

    it('should throw with correct message', () => {
      expect(() => validator.validateUserId(0))
        .toThrow('ID user tidak valid');
    });
  });

  // ==========================================================================
  // VALIDATE EXISTS TESTS
  // ==========================================================================
  describe('validateExists', () => {
    it('should pass when medical record exists', () => {
      const record = createMockMedicalRecord();
      expect(() => validator.validateExists(record)).not.toThrow();
    });

    it('should throw error when medical record is null', () => {
      expect(() => validator.validateExists(null))
        .toThrow(BadRequestException);
    });

    it('should throw error when medical record is undefined', () => {
      expect(() => validator.validateExists(undefined))
        .toThrow(BadRequestException);
    });

    it('should throw with correct message', () => {
      expect(() => validator.validateExists(null))
        .toThrow('Rekam medis tidak ditemukan');
    });
  });

  // ==========================================================================
  // VALIDATE FIELD LENGTH TESTS
  // ==========================================================================
  describe('validateFieldLength', () => {
    it('should pass for valid field length', () => {
      const shortText = 'A'.repeat(100);
      expect(() => validator.validateFieldLength('Subjektif', shortText))
        .not.toThrow();
    });

    it('should pass for text at max length', () => {
      const maxText = 'A'.repeat(5000);
      expect(() => validator.validateFieldLength('Subjektif', maxText))
        .not.toThrow();
    });

    it('should throw error for text exceeding max length', () => {
      const tooLong = 'A'.repeat(5001);
      expect(() => validator.validateFieldLength('Subjektif', tooLong))
        .toThrow(BadRequestException);
    });

    it('should throw error with correct message', () => {
      const tooLong = 'A'.repeat(5001);
      expect(() => validator.validateFieldLength('Subjektif', tooLong))
        .toThrow('Subjektif tidak boleh lebih dari 5000 karakter');
    });

    it('should use custom max length', () => {
      const text = 'A'.repeat(101);
      expect(() => validator.validateFieldLength('Test', text, 100))
        .toThrow(BadRequestException);
    });

    it('should pass for empty string', () => {
      expect(() => validator.validateFieldLength('Subjektif', ''))
        .not.toThrow();
    });

    it('should pass for null value', () => {
      expect(() => validator.validateFieldLength('Subjektif', null))
        .not.toThrow();
    });

    it('should pass for undefined value', () => {
      expect(() => validator.validateFieldLength('Subjektif', undefined))
        .not.toThrow();
    });
  });

  // ==========================================================================
  // VALIDATE SOAP FIELDS TESTS
  // ==========================================================================
  describe('validateSOAPFields', () => {
    it('should pass for valid SOAP fields', () => {
      const data: Partial<MedicalRecord> = {
        subjektif: 'A'.repeat(1000),
        objektif: 'B'.repeat(1000),
        assessment: 'C'.repeat(1000),
        plan: 'D'.repeat(1000),
      };

      expect(() => validator.validateSOAPFields(data)).not.toThrow();
    });

    it('should throw error for too long subjektif', () => {
      const data: Partial<MedicalRecord> = {
        subjektif: 'A'.repeat(5001),
      };

      expect(() => validator.validateSOAPFields(data))
        .toThrow(BadRequestException);
    });

    it('should throw error for too long objektif', () => {
      const data: Partial<MedicalRecord> = {
        objektif: 'B'.repeat(5001),
      };

      expect(() => validator.validateSOAPFields(data))
        .toThrow(BadRequestException);
    });

    it('should throw error for too long assessment', () => {
      const data: Partial<MedicalRecord> = {
        assessment: 'C'.repeat(5001),
      };

      expect(() => validator.validateSOAPFields(data))
        .toThrow(BadRequestException);
    });

    it('should throw error for too long plan', () => {
      const data: Partial<MedicalRecord> = {
        plan: 'D'.repeat(5001),
      };

      expect(() => validator.validateSOAPFields(data))
        .toThrow(BadRequestException);
    });

    it('should pass when no SOAP fields provided', () => {
      const data: Partial<MedicalRecord> = {};

      expect(() => validator.validateSOAPFields(data)).not.toThrow();
    });

    it('should pass for null SOAP fields', () => {
      const data: Partial<MedicalRecord> = {
        subjektif: null,
        objektif: null,
        assessment: null,
        plan: null,
      };

      expect(() => validator.validateSOAPFields(data)).not.toThrow();
    });

    it('should validate all fields when multiple are provided', () => {
      const data: Partial<MedicalRecord> = {
        subjektif: 'A'.repeat(4999),
        objektif: 'B'.repeat(4999),
        assessment: 'C'.repeat(5001), // This should fail
        plan: 'D'.repeat(4999),
      };

      expect(() => validator.validateSOAPFields(data))
        .toThrow(BadRequestException);
    });
  });

  // ==========================================================================
  // VALIDATE RELATIONS LOADED TESTS
  // ==========================================================================
  describe('validateRelationsLoaded', () => {
    it('should pass when required relations are loaded', () => {
      const record = createMockMedicalRecord();
      const relations = ['appointment', 'doctor', 'patient'];

      expect(() => validator.validateRelationsLoaded(record, relations))
        .not.toThrow();
    });

    it('should throw error when relation is missing', () => {
      const record = createMockMedicalRecord();
      (record as any).appointment = null; // bypass TS
      const relations = ['appointment'];

      expect(() => validator.validateRelationsLoaded(record, relations))
        .toThrow(BadRequestException);
    });

    it('should throw error with correct relation name', () => {
      const record = createMockMedicalRecord();
      (record as any).doctor = null; // bypass TS
      const relations = ['doctor'];

      expect(() => validator.validateRelationsLoaded(record, relations))
        .toThrow("Relation 'doctor' harus dimuat terlebih dahulu");
    });

    it('should validate multiple relations', () => {
      const record = createMockMedicalRecord();
      const relations = ['appointment', 'doctor', 'patient'];

      expect(() => validator.validateRelationsLoaded(record, relations))
        .not.toThrow();
    });

    it('should throw error for first missing relation', () => {
      const record = createMockMedicalRecord();
      (record as any).appointment = null; // bypass TS
      (record as any).doctor = null;       // bypass TS
      const relations = ['appointment', 'doctor'];

      expect(() => validator.validateRelationsLoaded(record, relations))
        .toThrow("Relation 'appointment' harus dimuat terlebih dahulu");
    });

    it('should pass when no relations are required', () => {
      const record = createMockMedicalRecord();
      const relations = [];

      expect(() => validator.validateRelationsLoaded(record, relations))
        .not.toThrow();
    });

    it('should throw error when relation is undefined', () => {
      const record = createMockMedicalRecord();
      (record as any).patient = undefined; // bypass TS
      const relations = ['patient'];

      expect(() => validator.validateRelationsLoaded(record, relations))
        .toThrow(BadRequestException);
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  describe('Edge Cases', () => {
    it('should handle very large valid IDs', () => {
      expect(() => validator.validateId(Number.MAX_SAFE_INTEGER))
        .not.toThrow();
    });

    it('should handle exactly 5000 character field', () => {
      const exactLength = 'A'.repeat(5000);
      expect(() => validator.validateFieldLength('Test', exactLength))
        .not.toThrow();
    });

    it('should handle exactly 5001 character field', () => {
      const overLength = 'A'.repeat(5001);
      expect(() => validator.validateFieldLength('Test', overLength))
        .toThrow(BadRequestException);
    });

    it('should handle special characters in field content', () => {
      const special = 'Test with "quotes" and \'apostrophes\' & symbols!';
      expect(() => validator.validateFieldLength('Test', special))
        .not.toThrow();
    });

    it('should handle unicode characters', () => {
      const unicode = '测试 тест 테스트 🎉';
      expect(() => validator.validateFieldLength('Test', unicode))
        .not.toThrow();
    });

    it('should handle newlines and tabs in fields', () => {
      const withNewlines = 'Line 1\nLine 2\tTabbed';
      expect(() => validator.validateFieldLength('Test', withNewlines))
        .not.toThrow();
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================
  describe('Integration Scenarios', () => {
    it('should validate complete medical record data', () => {
      const record = createMockMedicalRecord();

      expect(() => {
        validator.validateId(record.id);
        validator.validateAppointmentId(record.appointment_id);
        validator.validateUserId(record.doctor_id);
        validator.validateExists(record);
        validator.validateSOAPFields(record);
      }).not.toThrow();
    });

    it('should validate record with relations', () => {
      const record = createMockMedicalRecord();

      expect(() => {
        validator.validateExists(record);
        validator.validateRelationsLoaded(record, ['appointment', 'doctor', 'patient']);
      }).not.toThrow();
    });

    it('should fail validation for incomplete record', () => {
      const record = createMockMedicalRecord();
      record.id = 0; // Invalid

      expect(() => validator.validateId(record.id))
        .toThrow(BadRequestException);
    });
  });
});