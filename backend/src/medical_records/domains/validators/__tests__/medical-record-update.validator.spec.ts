// ============================================================================
// IMPORTS
// ============================================================================
import { BadRequestException } from '@nestjs/common';
import { MedicalRecordUpdateValidator } from '../medical-record-update.validator';
import { UpdateMedicalRecordDto } from '../../../applications/dto/update-medical-record.dto';
import { MedicalRecord } from '../../entities/medical-record.entity';
import { AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';

// ============================================================================
// MOCK DATA
// ============================================================================
const createMockRecord = (overrides?: Partial<MedicalRecord>): MedicalRecord => {
  const now = Date.now();
  const recentDate = new Date(now - 1 * 86400000);
  return {
    id: 1,
    patient_id: 100,
    doctor_id: 2,
    appointment_id: 1,
    subjektif: 'Keluhan pasien',
    objektif: 'Hasil pemeriksaan',
    assessment: 'Diagnosis',
    plan: 'Rencana terapi',
    created_at: recentDate,
    updated_at: recentDate,
    deleted_at: null,
    appointment: {
      id: 1,
      status: AppointmentStatus.SELESAI,
      tanggal_janji: recentDate,
    } as any,
    ...overrides,
  } as MedicalRecord;
};

const createValidDto = (overrides?: Partial<UpdateMedicalRecordDto>): UpdateMedicalRecordDto => {
  return {
    subjektif: 'Updated keluhan',
    objektif: 'Updated hasil',
    assessment: 'Updated diagnosis',
    plan: 'Updated rencana',
    ...overrides,
  };
};

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordUpdateValidator', () => {
  let validator: MedicalRecordUpdateValidator;

  // ============================================================================
  // SETUP AND TEARDOWN
  // ============================================================================
  beforeEach(() => {
    validator = new MedicalRecordUpdateValidator();
  });

  // ============================================================================
  // BASIC TESTS
  // ============================================================================
  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  // ============================================================================
  // VALIDATE METHOD TESTS
  // ============================================================================
  describe('validate', () => {
    it('should pass validation for valid update', () => {
      const dto = createValidDto();
      const record = createMockRecord();

      expect(() => validator.validate(dto, record)).not.toThrow();
    });

    it('should throw error if dto is null', () => {
      const record = createMockRecord();

      expect(() => validator.validate(null as any, record))
        .toThrow(BadRequestException);
      expect(() => validator.validate(null as any, record))
        .toThrow('Data update harus diisi');
    });

    it('should throw error if record is null', () => {
      const dto = createValidDto();

      expect(() => validator.validate(dto, null as any))
        .toThrow(BadRequestException);
      expect(() => validator.validate(dto, null as any))
        .toThrow('Rekam medis tidak ditemukan');
    });

    it('should validate record age constraint', () => {
      const dto = createValidDto();
      const oldRecord = createMockRecord({
        created_at: new Date('2020-01-01'), // More than 90 days old
      });

      expect(() => validator.validate(dto, oldRecord))
        .toThrow(BadRequestException);
      expect(() => validator.validate(dto, oldRecord))
        .toThrow('tidak dapat diubah');
    });

    it('should throw error for cancelled appointment', () => {
      const dto = createValidDto();
      const record = createMockRecord({
        appointment: {
          id: 1,
          status: AppointmentStatus.DIBATALKAN,
        } as any,
      });

      expect(() => validator.validate(dto, record))
        .toThrow(BadRequestException);
      expect(() => validator.validate(dto, record))
        .toThrow('janji temu yang dibatalkan');
    });

    it('should throw error for deleted record', () => {
      const dto = createValidDto();
      const record = createMockRecord({
        deleted_at: new Date(),
      });

      expect(() => validator.validate(dto, record))
        .toThrow(BadRequestException);
      expect(() => validator.validate(dto, record))
        .toThrow('sudah dihapus');
    });
  });

  // ============================================================================
  // VALIDATE DTO TESTS
  // ============================================================================
  describe('validateDto', () => {
    it('should pass for valid dto', () => {
      const dto = createValidDto();

      expect(() => validator.validateDto(dto)).not.toThrow();
    });

    it('should throw error if no fields are being updated', () => {
      const dto: UpdateMedicalRecordDto = {};

      expect(() => validator.validateDto(dto))
        .toThrow(BadRequestException);
      expect(() => validator.validateDto(dto))
        .toThrow('Setidaknya satu field harus diisi');
    });

    it('should pass if only subjektif is updated', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: 'New value',
      };

      expect(() => validator.validateDto(dto)).not.toThrow();
    });

    it('should pass if multiple fields are updated', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: 'New value',
        objektif: 'Another value',
      };

      expect(() => validator.validateDto(dto)).not.toThrow();
    });
  });

  // ============================================================================
  // VALIDATE SOAP FIELDS TESTS
  // ============================================================================
  describe('validateSOAPFields', () => {
    describe('Field Length Validation', () => {
      it('should pass for valid field lengths', () => {
        const dto = createValidDto({
          subjektif: 'Valid text',
          objektif: 'Valid text',
          assessment: 'Valid text',
          plan: 'Valid text',
        });

        expect(() => validator.validateSOAPFields(dto)).not.toThrow();
      });

      it('should throw error if subjektif exceeds max length', () => {
        const dto = createValidDto({
          subjektif: 'a'.repeat(5001),
        });

        expect(() => validator.validateSOAPFields(dto))
          .toThrow(BadRequestException);
        expect(() => validator.validateSOAPFields(dto))
          .toThrow('tidak boleh lebih dari 5000 karakter');
      });

      it('should throw error if field is too short (less than 3 chars)', () => {
        const dto = createValidDto({
          subjektif: 'ab',
        });

        expect(() => validator.validateSOAPFields(dto))
          .toThrow(BadRequestException);
        expect(() => validator.validateSOAPFields(dto))
          .toThrow('minimal 3 karakter');
      });

      it('should allow empty string to clear field', () => {
        const dto = createValidDto({
          subjektif: '',
        });

        expect(() => validator.validateSOAPFields(dto)).not.toThrow();
      });
    });

    describe('Field Content Validation', () => {
      it('should throw error for whitespace-only content', () => {
        const dto = createValidDto({
          subjektif: '   ',
        });

        expect(() => validator.validateSOAPFields(dto))
          .toThrow(BadRequestException);
        expect(() => validator.validateSOAPFields(dto))
          .toThrow('tidak boleh hanya berisi spasi');
      });

      it('should throw error for only punctuation', () => {
        const dto = createValidDto({
          subjektif: '....',
        });

        expect(() => validator.validateSOAPFields(dto))
          .toThrow(BadRequestException);
        expect(() => validator.validateSOAPFields(dto))
          .toThrow('harus berisi teks yang valid');
      });

      it('should pass for valid text content', () => {
        const dto = createValidDto({
          subjektif: 'Valid medical text',
        });

        expect(() => validator.validateSOAPFields(dto)).not.toThrow();
      });
    });
  });

  // ============================================================================
  // VALIDATE BUSINESS RULES TESTS
  // ============================================================================
  describe('validateBusinessRules', () => {
    it('should throw error if trying to clear all fields', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: '',
        objektif: '',
        assessment: '',
        plan: '',
      };
      const record = createMockRecord();

      expect(() => validator.validateBusinessRules(dto, record))
        .toThrow(BadRequestException);
      expect(() => validator.validateBusinessRules(dto, record))
        .toThrow('mengosongkan semua field SOAP');
    });

    it('should pass if at least one field remains filled', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: '',
        objektif: 'Still filled',
      };
      const record = createMockRecord();

      expect(() => validator.validateBusinessRules(dto, record)).not.toThrow();
    });

    it('should throw error for records older than 90 days', () => {
      const dto = createValidDto();
      const oldRecord = createMockRecord({
        created_at: new Date('2020-01-01'),
      });

      expect(() => validator.validateBusinessRules(dto, oldRecord))
        .toThrow(BadRequestException);
    });

    it('should pass for recent records', () => {
      const dto = createValidDto();
      const recentRecord = createMockRecord({
        created_at: new Date(),
      });

      expect(() => validator.validateBusinessRules(dto, recentRecord)).not.toThrow();
    });
  });

  // ============================================================================
  // VALIDATE HAS CHANGES TESTS
  // ============================================================================
  describe('validateHasChanges', () => {
    it('should throw error if no changes are made', () => {
      const record = createMockRecord();
      const dto: UpdateMedicalRecordDto = {
        subjektif: record.subjektif,
        objektif: record.objektif,
      };

      expect(() => validator.validateHasChanges(dto, record))
        .toThrow(BadRequestException);
      expect(() => validator.validateHasChanges(dto, record))
        .toThrow('Tidak ada perubahan');
    });

    it('should pass if at least one field is changed', () => {
      const record = createMockRecord();
      const dto: UpdateMedicalRecordDto = {
        subjektif: 'New value',
      };

      expect(() => validator.validateHasChanges(dto, record)).not.toThrow();
    });

    it('should detect changes in all fields', () => {
      const record = createMockRecord();
      const dto = createValidDto({
        subjektif: 'Changed',
        objektif: 'Changed',
        assessment: 'Changed',
        plan: 'Changed',
      });

      expect(() => validator.validateHasChanges(dto, record)).not.toThrow();
    });
  });

  // ============================================================================
  // GET UPDATED FIELDS TESTS
  // ============================================================================
  describe('getUpdatedFields', () => {
    it('should return empty array if no fields updated', () => {
      const dto: UpdateMedicalRecordDto = {};

      const result = validator.getUpdatedFields(dto);

      expect(result).toEqual([]);
    });

    it('should return list of updated fields', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: 'New',
        assessment: 'New',
      };

      const result = validator.getUpdatedFields(dto);

      expect(result).toEqual(['subjektif', 'assessment']);
      expect(result).toHaveLength(2);
    });

    it('should return all fields when all are updated', () => {
      const dto = createValidDto();

      const result = validator.getUpdatedFields(dto);

      expect(result).toEqual(['subjektif', 'objektif', 'assessment', 'plan']);
      expect(result).toHaveLength(4);
    });
  });

  // ============================================================================
  // GET VALIDATION WARNINGS TESTS
  // ============================================================================
  describe('getValidationWarnings', () => {
    it('should return empty array for valid update', () => {
      const dto = createValidDto();
      const record = createMockRecord({
        created_at: new Date(),
      });

      const warnings = validator.getValidationWarnings(dto, record);

      expect(warnings).toEqual([]);
    });

    it('should warn when clearing fields', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: '',
      };
      const record = createMockRecord();

      const warnings = validator.getValidationWarnings(dto, record);

      expect(warnings).toContain('Field Subjektif akan dikosongkan');
    });

    it('should warn for old records', () => {
      const dto = createValidDto();
      const oldRecord = createMockRecord({
        created_at: new Date('2024-01-01'),
      });

      const warnings = validator.getValidationWarnings(dto, oldRecord);

      expect(warnings.some(w => w.includes('berumur'))).toBe(true);
    });

    it('should return multiple warnings', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: '',
        objektif: '',
      };
      const oldRecord = createMockRecord({
        created_at: new Date('2024-01-01'),
      });

      const warnings = validator.getValidationWarnings(dto, oldRecord);

      expect(warnings.length).toBeGreaterThan(1);
    });
  });

  // ============================================================================
  // WILL BE COMPLETE TESTS
  // ============================================================================
  describe('willBeComplete', () => {
    it('should return true if all fields will be filled', () => {
      const dto = createValidDto();
      const record = createMockRecord();

      const result = validator.willBeComplete(dto, record);

      expect(result).toBe(true);
    });

    it('should return false if any field will be empty', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: '',
      };
      const record = createMockRecord();

      const result = validator.willBeComplete(dto, record);

      expect(result).toBe(false);
    });

    it('should return true if updating to make record complete', () => {
      const dto: UpdateMedicalRecordDto = {
        plan: 'New plan',
      };
      const incompleteRecord = createMockRecord({
        plan: '',
      });

      const result = validator.willBeComplete(dto, incompleteRecord);

      expect(result).toBe(true);
    });

    it('should return false if fields remain incomplete', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: 'Updated',
      };
      const incompleteRecord = createMockRecord({
        plan: '',
      });

      const result = validator.willBeComplete(dto, incompleteRecord);

      expect(result).toBe(false);
    });
  });

  // ============================================================================
  // CALCULATE RECORD AGE TESTS
  // ============================================================================
  describe('calculateRecordAge', () => {
    it('should calculate age correctly', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-02-01'));

      const validator = new MedicalRecordUpdateValidator();
      const dto = createValidDto();

      const record = createMockRecord({
        created_at: new Date('2024-01-02'),
      });

      const warnings = validator.getValidationWarnings(dto, record);
      console.log("WARNINGS:", warnings);

      expect(warnings.some(w => w.includes('30 hari'))).toBe(true);

      jest.useRealTimers();
    });

  });

  // ============================================================================
  // EDGE CASES TESTS
  // ============================================================================
  describe('Edge Cases', () => {
    it('should handle undefined values correctly', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: undefined,
        objektif: 'Valid',
      };

      expect(() => validator.validateDto(dto)).not.toThrow();
    });

    it('should handle null appointment', () => {
      const dto = createValidDto();
      const record = createMockRecord({
        appointment: null as any,
      });

      expect(() => validator.validate(dto, record))
        .toThrow(BadRequestException);
    });

    it('should handle record at exactly 90 days', () => {
      const dto = createValidDto();
      const record = createMockRecord({
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      });

      expect(() => validator.validateBusinessRules(dto, record)).not.toThrow();
    });

    it('should handle record at 91 days', () => {
      const dto = createValidDto();
      const record = createMockRecord({
        created_at: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000),
      });

      expect(() => validator.validateBusinessRules(dto, record))
        .toThrow(BadRequestException);
    });
  });
});