import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateMedicalRecordDto } from '../create-medical-record.dto';

describe('CreateMedicalRecordDto', () => {
  // ==================== MOCK DATA ====================
  const validDto = {
    appointment_id: 1,
    user_id_staff: 2,
    subjektif: 'Pasien mengeluh demam sejak 3 hari yang lalu',
    objektif: 'Suhu: 38.5°C, TD: 120/80, Nadi: 88x/menit',
    assessment: 'Demam dengan suspek infeksi saluran pernapasan atas',
    plan: 'Berikan paracetamol 500mg 3x sehari, istirahat cukup',
  };

  // ==================== SETUP AND TEARDOWN ====================
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== VALIDATION TESTS ====================
  describe('Validation', () => {
    it('should validate successfully with all required fields', async () => {
      const dto = plainToClass(CreateMedicalRecordDto, validDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate successfully with only required fields', async () => {
      const minimalDto = {
        appointment_id: 1,
        user_id_staff: 2,
      };
      const dto = plainToClass(CreateMedicalRecordDto, minimalDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when appointment_id is missing', async () => {
      const invalidDto = { ...validDto };
      delete invalidDto.appointment_id;
      const dto = plainToClass(CreateMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('appointment_id');
    });

    it('should fail when user_id_staff is missing', async () => {
      const invalidDto = { ...validDto };
      delete invalidDto.user_id_staff;
      const dto = plainToClass(CreateMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('user_id_staff');
    });

    it('should fail when appointment_id is not a number', async () => {
      const invalidDto = { ...validDto, appointment_id: 'not-a-number' };
      const dto = plainToClass(CreateMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ==================== FIELD LENGTH VALIDATION TESTS ====================
  describe('Field Length Validation', () => {
    it('should fail when subjektif exceeds 5000 characters', async () => {
      const invalidDto = {
        ...validDto,
        subjektif: 'a'.repeat(5001),
      };
      const dto = plainToClass(CreateMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'subjektif')).toBe(true);
    });

    it('should fail when objektif exceeds 5000 characters', async () => {
      const invalidDto = {
        ...validDto,
        objektif: 'a'.repeat(5001),
      };
      const dto = plainToClass(CreateMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'objektif')).toBe(true);
    });

    it('should fail when assessment exceeds 5000 characters', async () => {
      const invalidDto = {
        ...validDto,
        assessment: 'a'.repeat(5001),
      };
      const dto = plainToClass(CreateMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'assessment')).toBe(true);
    });

    it('should fail when plan exceeds 5000 characters', async () => {
      const invalidDto = {
        ...validDto,
        plan: 'a'.repeat(5001),
      };
      const dto = plainToClass(CreateMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'plan')).toBe(true);
    });
  });

  // ==================== TRANSFORMATION TESTS ====================
  describe('Transformation', () => {
    it('should trim whitespace from subjektif', () => {
      const dtoData = {
        ...validDto,
        subjektif: '  test subjektif  ',
      };
      const dto = plainToClass(CreateMedicalRecordDto, dtoData);
      expect(dto.subjektif).toBe('test subjektif');
    });

    it('should trim whitespace from objektif', () => {
      const dtoData = {
        ...validDto,
        objektif: '  test objektif  ',
      };
      const dto = plainToClass(CreateMedicalRecordDto, dtoData);
      expect(dto.objektif).toBe('test objektif');
    });

    it('should trim whitespace from assessment', () => {
      const dtoData = {
        ...validDto,
        assessment: '  test assessment  ',
      };
      const dto = plainToClass(CreateMedicalRecordDto, dtoData);
      expect(dto.assessment).toBe('test assessment');
    });

    it('should trim whitespace from plan', () => {
      const dtoData = {
        ...validDto,
        plan: '  test plan  ',
      };
      const dto = plainToClass(CreateMedicalRecordDto, dtoData);
      expect(dto.plan).toBe('test plan');
    });
  });

  // ==================== OPTIONAL FIELDS TESTS ====================
  describe('Optional Fields', () => {
    it('should allow undefined subjektif', async () => {
      const dto = plainToClass(CreateMedicalRecordDto, {
        appointment_id: 1,
        user_id_staff: 2,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow empty string for optional fields', async () => {
      const dto = plainToClass(CreateMedicalRecordDto, {
        appointment_id: 1,
        user_id_staff: 2,
        subjektif: '',
        objektif: '',
        assessment: '',
        plan: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});