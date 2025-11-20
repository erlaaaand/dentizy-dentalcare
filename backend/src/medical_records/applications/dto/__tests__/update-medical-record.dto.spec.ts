import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateMedicalRecordDto } from '../update-medical-record.dto';

describe('UpdateMedicalRecordDto', () => {
  // ==================== MOCK DATA ====================
  const validDto = {
    subjektif: 'Updated subjektif',
    objektif: 'Updated objektif',
    assessment: 'Updated assessment',
    plan: 'Updated plan',
  };

  // ==================== SETUP AND TEARDOWN ====================
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== VALIDATION TESTS ====================
  describe('Validation', () => {
    it('should validate successfully with all fields', async () => {
      const dto = plainToClass(UpdateMedicalRecordDto, validDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate successfully with partial fields', async () => {
      const partialDto = {
        subjektif: 'Updated subjektif only',
      };
      const dto = plainToClass(UpdateMedicalRecordDto, partialDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate successfully with empty object', async () => {
      const dto = plainToClass(UpdateMedicalRecordDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when subjektif is not a string', async () => {
      const invalidDto = { subjektif: 123 };
      const dto = plainToClass(UpdateMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when objektif is not a string', async () => {
      const invalidDto = { objektif: true };
      const dto = plainToClass(UpdateMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ==================== OPTIONAL FIELDS TESTS ====================
  describe('Optional Fields', () => {
    it('should allow undefined subjektif', async () => {
      const dto = plainToClass(UpdateMedicalRecordDto, {
        objektif: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow undefined objektif', async () => {
      const dto = plainToClass(UpdateMedicalRecordDto, {
        subjektif: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow undefined assessment', async () => {
      const dto = plainToClass(UpdateMedicalRecordDto, {
        plan: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow undefined plan', async () => {
      const dto = plainToClass(UpdateMedicalRecordDto, {
        assessment: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow empty strings', async () => {
      const dto = plainToClass(UpdateMedicalRecordDto, {
        subjektif: '',
        objektif: '',
        assessment: '',
        plan: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ==================== FIELD UPDATE TESTS ====================
  describe('Field Updates', () => {
    it('should update only subjektif', async () => {
      const dto = plainToClass(UpdateMedicalRecordDto, {
        subjektif: 'New subjektif',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.subjektif).toBe('New subjektif');
      expect(dto.objektif).toBeUndefined();
    });

    it('should update only objektif', async () => {
      const dto = plainToClass(UpdateMedicalRecordDto, {
        objektif: 'New objektif',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.objektif).toBe('New objektif');
      expect(dto.subjektif).toBeUndefined();
    });

    it('should update multiple fields', async () => {
      const dto = plainToClass(UpdateMedicalRecordDto, {
        subjektif: 'New subjektif',
        assessment: 'New assessment',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.subjektif).toBe('New subjektif');
      expect(dto.assessment).toBe('New assessment');
    });
  });
});