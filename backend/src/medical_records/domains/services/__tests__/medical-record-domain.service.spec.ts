// ============================================================================
// IMPORTS
// ============================================================================
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { MedicalRecordDomainService } from '../medical-record-domain.service';
import { MedicalRecord } from '../../entities/medical-record.entity';
import { Appointment, AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';

// ============================================================================
// MOCK DATA
// ============================================================================
const createMockMedicalRecord = (): Partial<MedicalRecord> => ({
  id: 1,
  appointment_id: 10,
  doctor_id: 2,
  patient_id: 3,
  subjektif: 'Pasien mengeluh sakit kepala',
  objektif: 'TD: 120/80',
  assessment: 'Tension headache',
  plan: 'Istirahat cukup',
  created_at: new Date('2024-01-15'),
});

const createMockAppointment = (status: AppointmentStatus = AppointmentStatus.DIJADWALKAN): Appointment => ({
  id: 10,
  patient_id: 3,
  doctor_id: 2,
  tanggal_janji: new Date('2024-01-15'),
  status,
} as Appointment);

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordDomainService', () => {
  let service: MedicalRecordDomainService;

  // ==========================================================================
  // SETUP AND TEARDOWN
  // ==========================================================================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalRecordDomainService],
    }).compile();

    service = module.get<MedicalRecordDomainService>(MedicalRecordDomainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================================
  // VALIDATE SOAP CONTENT TESTS
  // ==========================================================================
  describe('validateSOAPContent', () => {
    it('should pass when at least one SOAP field is filled', () => {
      const record: Partial<MedicalRecord> = {
        subjektif: 'Pasien mengeluh sakit kepala',
      };

      expect(() => service.validateSOAPContent(record)).not.toThrow();
    });

    it('should throw error when all SOAP fields are empty', () => {
      const record: Partial<MedicalRecord> = {
        subjektif: null,
        objektif: null,
        assessment: null,
        plan: null,
      };

      expect(() => service.validateSOAPContent(record))
        .toThrow(BadRequestException);
    });

    it('should pass when multiple SOAP fields are filled', () => {
      const record = createMockMedicalRecord();

      expect(() => service.validateSOAPContent(record)).not.toThrow();
    });

    it('should throw error when all fields are undefined', () => {
      const record: Partial<MedicalRecord> = {};

      expect(() => service.validateSOAPContent(record))
        .toThrow(BadRequestException);
    });

    it('should pass when only plan is filled', () => {
      const record: Partial<MedicalRecord> = {
        plan: 'Istirahat cukup',
      };

      expect(() => service.validateSOAPContent(record)).not.toThrow();
    });
  });

  // ==========================================================================
  // VALIDATE APPOINTMENT ELIGIBILITY TESTS
  // ==========================================================================
  describe('validateAppointmentEligibility', () => {
    it('should pass for valid appointment', () => {
      const appointment = createMockAppointment(AppointmentStatus.DIJADWALKAN);

      expect(() => service.validateAppointmentEligibility(appointment))
        .not.toThrow();
    });

    it('should throw error for cancelled appointment', () => {
      const appointment = createMockAppointment(AppointmentStatus.DIBATALKAN);

      expect(() => service.validateAppointmentEligibility(appointment))
        .toThrow(ConflictException);
    });

    it('should throw error when appointment is null', () => {
      expect(() => service.validateAppointmentEligibility(null))
        .toThrow(BadRequestException);
    });

    it('should pass for SELESAI appointment', () => {
      const appointment = createMockAppointment(AppointmentStatus.SELESAI);

      expect(() => service.validateAppointmentEligibility(appointment))
        .not.toThrow();
    });

    it('should throw error when appointment is undefined', () => {
      expect(() => service.validateAppointmentEligibility(undefined))
        .toThrow(BadRequestException);
    });
  });

  // ==========================================================================
  // VALIDATE APPOINTMENT FOR UPDATE TESTS
  // ==========================================================================
  describe('validateAppointmentForUpdate', () => {
    it('should pass for non-cancelled appointment', () => {
      const appointment = createMockAppointment(AppointmentStatus.DIJADWALKAN);

      expect(() => service.validateAppointmentForUpdate(appointment))
        .not.toThrow();
    });

    it('should throw error for cancelled appointment', () => {
      const appointment = createMockAppointment(AppointmentStatus.DIBATALKAN);

      expect(() => service.validateAppointmentForUpdate(appointment))
        .toThrow(ConflictException);
    });

    it('should pass for SELESAI appointment', () => {
      const appointment = createMockAppointment(AppointmentStatus.SELESAI);

      expect(() => service.validateAppointmentForUpdate(appointment))
        .not.toThrow();
    });
  });

  // ==========================================================================
  // VALIDATE NO EXISTING RECORD TESTS
  // ==========================================================================
  describe('validateNoExistingRecord', () => {
    it('should pass when no existing record', () => {
      expect(() => service.validateNoExistingRecord(null))
        .not.toThrow();
    });

    it('should throw error when existing record found', () => {
      const existingRecord = createMockMedicalRecord() as MedicalRecord;

      expect(() => service.validateNoExistingRecord(existingRecord))
        .toThrow(ConflictException);
    });

    it('should throw error with correct message', () => {
      const existingRecord = createMockMedicalRecord() as MedicalRecord;

      expect(() => service.validateNoExistingRecord(existingRecord))
        .toThrow('Janji temu ini sudah memiliki rekam medis');
    });
  });

  // ==========================================================================
  // CALCULATE RECORD AGE TESTS
  // ==========================================================================
  describe('calculateRecordAge', () => {
    it('should calculate age in days correctly', () => {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const age = service.calculateRecordAge(thirtyDaysAgo);

      expect(age).toBeGreaterThanOrEqual(29);
      expect(age).toBeLessThanOrEqual(31);
    });

    it('should return 0 for today', () => {
      const today = new Date();
      const age = service.calculateRecordAge(today);

      expect(age).toBe(0);
    });

    it('should handle year-old records', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const age = service.calculateRecordAge(oneYearAgo);

      expect(age).toBeGreaterThanOrEqual(364);
      expect(age).toBeLessThanOrEqual(366);
    });

    it('should handle records created in the past hour', () => {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const age = service.calculateRecordAge(oneHourAgo);

      expect(age).toBe(0);
    });
  });

  // ==========================================================================
  // SHOULD UPDATE APPOINTMENT STATUS TESTS
  // ==========================================================================
  describe('shouldUpdateAppointmentStatus', () => {
    it('should return true for non-SELESAI appointment', () => {
      const appointment = createMockAppointment(AppointmentStatus.DIJADWALKAN);
      
      const result = service.shouldUpdateAppointmentStatus(appointment);

      expect(result).toBe(true);
    });

    it('should return false for SELESAI appointment', () => {
      const appointment = createMockAppointment(AppointmentStatus.SELESAI);
      
      const result = service.shouldUpdateAppointmentStatus(appointment);

      expect(result).toBe(false);
    });

    it('should return true for DIBATALKAN appointment', () => {
      const appointment = createMockAppointment(AppointmentStatus.DIBATALKAN);
      
      const result = service.shouldUpdateAppointmentStatus(appointment);

      expect(result).toBe(true);
    });
  });

  // ==========================================================================
  // NORMALIZE SOAP FIELDS TESTS
  // ==========================================================================
  describe('normalizeSOAPFields', () => {
    it('should trim all SOAP fields', () => {
      const data: Partial<MedicalRecord> = {
        subjektif: '  Pasien mengeluh  ',
        objektif: '  TD: 120/80  ',
        assessment: '  Tension headache  ',
        plan: '  Istirahat cukup  ',
      };

      const result = service.normalizeSOAPFields(data);

      expect(result.subjektif).toBe('Pasien mengeluh');
      expect(result.objektif).toBe('TD: 120/80');
      expect(result.assessment).toBe('Tension headache');
      expect(result.plan).toBe('Istirahat cukup');
    });

    it('should handle undefined fields', () => {
      const data: Partial<MedicalRecord> = {
        subjektif: 'Test',
      };

      const result = service.normalizeSOAPFields(data);

      expect(result.subjektif).toBe('Test');
      expect(result.objektif).toBeUndefined();
    });

    it('should not modify original data', () => {
      const data: Partial<MedicalRecord> = {
        subjektif: '  Test  ',
      };

      const result = service.normalizeSOAPFields(data);

      expect(data.subjektif).toBe('  Test  ');
      expect(result.subjektif).toBe('Test');
    });

    it('should handle empty strings', () => {
      const data: Partial<MedicalRecord> = {
        subjektif: '',
        objektif: '',
      };

      const result = service.normalizeSOAPFields(data);

      expect(result.subjektif).toBe('');
      expect(result.objektif).toBe('');
    });
  });

  // ==========================================================================
  // VALIDATE SOAP FIELD LENGTH TESTS
  // ==========================================================================
  describe('validateSOAPFieldLength', () => {
    it('should pass for valid length', () => {
      const value = 'A'.repeat(1000);

      expect(() => service.validateSOAPFieldLength('Subjektif', value))
        .not.toThrow();
    });

    it('should throw error for too long field', () => {
      const value = 'A'.repeat(5001);

      expect(() => service.validateSOAPFieldLength('Subjektif', value))
        .toThrow(BadRequestException);
    });

    it('should pass for empty string', () => {
      expect(() => service.validateSOAPFieldLength('Subjektif', ''))
        .not.toThrow();
    });

    it('should pass for exact max length', () => {
      const value = 'A'.repeat(5000);

      expect(() => service.validateSOAPFieldLength('Subjektif', value, 5000))
        .not.toThrow();
    });

    it('should use custom max length', () => {
      const value = 'A'.repeat(101);

      expect(() => service.validateSOAPFieldLength('Test', value, 100))
        .toThrow(BadRequestException);
    });
  });

  // ==========================================================================
  // VALIDATE ALL SOAP FIELDS TESTS
  // ==========================================================================
  describe('validateAllSOAPFields', () => {
    it('should validate all fields successfully', () => {
      const data = createMockMedicalRecord();

      expect(() => service.validateAllSOAPFields(data))
        .not.toThrow();
    });

    it('should throw error for too long subjektif', () => {
      const data: Partial<MedicalRecord> = {
        subjektif: 'A'.repeat(5001),
      };

      expect(() => service.validateAllSOAPFields(data))
        .toThrow(BadRequestException);
    });

    it('should validate multiple fields', () => {
      const data: Partial<MedicalRecord> = {
        subjektif: 'A'.repeat(4999),
        objektif: 'B'.repeat(4999),
      };

      expect(() => service.validateAllSOAPFields(data))
        .not.toThrow();
    });

    it('should handle undefined fields', () => {
      const data: Partial<MedicalRecord> = {};

      expect(() => service.validateAllSOAPFields(data))
        .not.toThrow();
    });
  });

  // ==========================================================================
  // IS RECORD COMPLETE TESTS
  // ==========================================================================
  describe('isRecordComplete', () => {
    it('should return true for complete record', () => {
      const record = createMockMedicalRecord() as MedicalRecord;

      const result = service.isRecordComplete(record);

      expect(result).toBe(true);
    });

    it('should return false when subjektif is missing', () => {
      const record = createMockMedicalRecord() as MedicalRecord;
      record.subjektif = null;

      const result = service.isRecordComplete(record);

      expect(result).toBe(false);
    });

    it('should return false when objektif is missing', () => {
      const record = createMockMedicalRecord() as MedicalRecord;
      record.objektif = null;

      const result = service.isRecordComplete(record);

      expect(result).toBe(false);
    });

    it('should return false for empty record', () => {
      const record = {
        subjektif: null,
        objektif: null,
        assessment: null,
        plan: null,
      } as MedicalRecord;

      const result = service.isRecordComplete(record);

      expect(result).toBe(false);
    });
  });

  // ==========================================================================
  // GET COMPLETION PERCENTAGE TESTS
  // ==========================================================================
  describe('getCompletionPercentage', () => {
    it('should return 100 for complete record', () => {
      const record = createMockMedicalRecord() as MedicalRecord;

      const result = service.getCompletionPercentage(record);

      expect(result).toBe(100);
    });

    it('should return 50 for half-filled record', () => {
      const record = {
        subjektif: 'Test',
        objektif: 'Test',
        assessment: null,
        plan: null,
      } as MedicalRecord;

      const result = service.getCompletionPercentage(record);

      expect(result).toBe(50);
    });

    it('should return 0 for empty record', () => {
      const record = {
        subjektif: null,
        objektif: null,
        assessment: null,
        plan: null,
      } as MedicalRecord;

      const result = service.getCompletionPercentage(record);

      expect(result).toBe(0);
    });

    it('should return 25 for one field filled', () => {
      const record = {
        subjektif: 'Test',
        objektif: null,
        assessment: null,
        plan: null,
      } as MedicalRecord;

      const result = service.getCompletionPercentage(record);

      expect(result).toBe(25);
    });

    it('should ignore whitespace-only fields', () => {
      const record = {
        subjektif: '   ',
        objektif: 'Test',
        assessment: null,
        plan: null,
      } as MedicalRecord;

      const result = service.getCompletionPercentage(record);

      expect(result).toBe(25);
    });
  });

  // ==========================================================================
  // VALIDATE UPDATE HAS CHANGES TESTS
  // ==========================================================================
  describe('validateUpdateHasChanges', () => {
    it('should pass when changes exist', () => {
      const updateData: Partial<MedicalRecord> = {
        subjektif: 'New value',
      };

      expect(() => service.validateUpdateHasChanges(updateData))
        .not.toThrow();
    });

    it('should throw error when no changes', () => {
      const updateData: Partial<MedicalRecord> = {};

      expect(() => service.validateUpdateHasChanges(updateData))
        .toThrow(BadRequestException);
    });

    it('should pass with multiple changes', () => {
      const updateData: Partial<MedicalRecord> = {
        subjektif: 'New',
        objektif: 'New',
      };

      expect(() => service.validateUpdateHasChanges(updateData))
        .not.toThrow();
    });
  });

  // ==========================================================================
  // MERGE UPDATE DATA TESTS
  // ==========================================================================
  describe('mergeUpdateData', () => {
    it('should merge update data with existing record', () => {
      const existing = createMockMedicalRecord() as MedicalRecord;
      const updates: Partial<MedicalRecord> = {
        subjektif: 'Updated subjektif',
      };

      const result = service.mergeUpdateData(existing, updates);

      expect(result.subjektif).toBe('Updated subjektif');
      expect(result.objektif).toBe(existing.objektif);
    });

    it('should normalize merged data', () => {
      const existing = createMockMedicalRecord() as MedicalRecord;
      const updates: Partial<MedicalRecord> = {
        subjektif: '  Updated  ',
      };

      const result = service.mergeUpdateData(existing, updates);

      expect(result.subjektif).toBe('Updated');
    });

    it('should update multiple fields', () => {
      const existing = createMockMedicalRecord() as MedicalRecord;
      const updates: Partial<MedicalRecord> = {
        subjektif: 'New S',
        objektif: 'New O',
      };

      const result = service.mergeUpdateData(existing, updates);

      expect(result.subjektif).toBe('New S');
      expect(result.objektif).toBe('New O');
      expect(result.assessment).toBe(existing.assessment);
    });
  });
});