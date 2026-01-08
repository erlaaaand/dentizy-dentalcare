// __tests__/applications/dto/update-patient.dto.spec.ts

// 1. IMPORTS
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePatientDto } from '../update-patient.dto';

// 2. MOCK DATA
const validPartialUpdate = {
  nama_lengkap: 'Budi Update', // Hanya update nama
};

const validStatusUpdate = {
  is_active: false, // Hanya update status
};

// 3. TEST SUITE
describe('UpdatePatientDto', () => {
  // 4. SETUP AND TEARDOWN
  // Stateless DTO test

  // 5. EXECUTE METHOD TESTS (Inheritance & PartialType Logic)

  it('should validate successfully with an empty object', async () => {
    // Ini adalah inti dari PartialType: field wajib di Create jadi optional di sini.
    const dto = plainToInstance(UpdatePatientDto, {});
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should validate successfully when providing only a subset of fields', async () => {
    const dto = plainToInstance(UpdatePatientDto, validPartialUpdate);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.nama_lengkap).toBe('Budi Update');
  });

  it('should still validate inherited rules if field is provided', async () => {
    // Testing inherited validation (e.g. Email format from CreatePatientDto)
    const dto = plainToInstance(UpdatePatientDto, {
      email: 'invalid-email-format',
    });
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  // 6. SUB-GROUP TESTS (New Fields)

  describe('is_active', () => {
    it('should accept boolean values (true)', async () => {
      const dto = plainToInstance(UpdatePatientDto, { is_active: true });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.is_active).toBe(true);
    });

    it('should accept boolean values (false)', async () => {
      const dto = plainToInstance(UpdatePatientDto, { is_active: false });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.is_active).toBe(false);
    });

    it('should fail if is_active is not a boolean (string)', async () => {
      const dto = plainToInstance(UpdatePatientDto, { is_active: 'true' }); // String 'true' vs Boolean true
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('is_active');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail if is_active is a number', async () => {
      const dto = plainToInstance(UpdatePatientDto, { is_active: 1 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('is_active');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });
});
