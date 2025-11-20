// __tests__/applications/dto/search-patient.dto.spec.ts

// 1. IMPORTS
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  SearchPatientDto,
  SortField,
  SortOrder
} from '../search-patient.dto';
import { Gender } from '../../../domains/entities/patient.entity';

// Mock Gender untuk isolasi test
/* enum Gender {
  MALE = 'L',
  FEMALE = 'P'
} */

// 2. MOCK DATA
const validFullQuery = {
  search: 'Budi',
  page: 2,
  limit: 20,
  sortBy: SortField.NAMA_LENGKAP,
  sortOrder: SortOrder.ASC,
  jenis_kelamin: Gender.MALE,
  umur_min: 20,
  umur_max: 40,
  tanggal_daftar_dari: '2023-01-01',
  tanggal_daftar_sampai: '2023-12-31',
  doctor_id: 5,
  is_active: true,
  is_new: false,
};

// 3. TEST SUITE
describe('SearchPatientDto', () => {

  // 4. SETUP AND TEARDOWN
  // DTO stateless, tidak butuh setup kompleks

  // 5. EXECUTE METHOD TESTS (Defaults & Basic Validation)

  it('should validate successfully with empty object (use defaults)', async () => {
    const dto = plainToInstance(SearchPatientDto, {});
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    // Check Defaults
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(dto.sortBy).toBe(SortField.CREATED_AT);
    expect(dto.sortOrder).toBe(SortOrder.DESC);
  });

  it('should validate successfully with full valid data', async () => {
    const dto = plainToInstance(SearchPatientDto, validFullQuery);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.search).toBe('Budi');
    expect(dto.page).toBe(2);
  });

  // 6. SUB-GROUP TESTS

  describe('Sanitization (Search Field)', () => {
    it('should sanitize search string (trim and remove special chars)', async () => {
      // Input contains spaces and dangerous chars (<, >)
      const rawData = { search: '  <script>alert("x")</script>  ' };
      const dto = plainToInstance(SearchPatientDto, rawData);

      // Expectation: spaces trimmed, < > ' " removed.
      // NOTE: Slash (/) is NOT removed by the regex /[<>'"]/g, so it remains.
      expect(dto.search).toBe('scriptalert(x)/script');
    });

    it('should handle undefined search gracefully', async () => {
      const dto = plainToInstance(SearchPatientDto, {});
      expect(dto.search).toBeUndefined();
    });

    // PERBAIKAN LOGIKA TEST:
    // Karena DTO melakukan .substring(0, 255), validasi MaxLength tidak akan pernah gagal (error).
    // Sebaliknya, kita harus memastikan string dipotong (truncated).
    it('should truncate search string if it exceeds 255 chars', async () => {
      const longString = 'a'.repeat(300);
      const dto = plainToInstance(SearchPatientDto, { search: longString });
      const errors = await validate(dto);

      // Tidak akan ada error karena dipotong otomatis oleh @Transform
      expect(errors.length).toBe(0);

      // Pastikan panjangnya pas 255
      expect(dto.search?.length).toBe(255);

      // Pastikan stringnya benar (255 karakter 'a')
      expect(dto.search).toBe('a'.repeat(255));
    });
  });

  describe('Type Coercion (Pagination & Numbers)', () => {
    it('should convert string numbers to actual numbers (page, limit)', async () => {
      // Query params usually come as strings
      const rawData = { page: '5', limit: '50', doctor_id: '10' };
      const dto = plainToInstance(SearchPatientDto, rawData);

      expect(typeof dto.page).toBe('number');
      expect(dto.page).toBe(5);
      expect(typeof dto.limit).toBe('number');
      expect(dto.limit).toBe(50);
      expect(dto.doctor_id).toBe(10);
    });

    it('should fail if page < 1', async () => {
      const dto = plainToInstance(SearchPatientDto, { page: 0 });
      const errors = await validate(dto);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail if limit > 100', async () => {
      const dto = plainToInstance(SearchPatientDto, { limit: 101 });
      const errors = await validate(dto);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('max');
    });
  });

  describe('Boolean Transformation (is_active, is_new)', () => {
    it('should convert string "true" to boolean true', async () => {
      const rawData = { is_active: 'true', is_new: 'true' };
      const dto = plainToInstance(SearchPatientDto, rawData);

      expect(typeof dto.is_active).toBe('boolean');
      expect(dto.is_active).toBe(true);
      expect(dto.is_new).toBe(true);
    });

    it('should convert string "false" (or arbitrary string) to boolean false', async () => {
      // Transform logic: value === 'true' || value === true
      const rawData = { is_active: 'false', is_new: 'random' };
      const dto = plainToInstance(SearchPatientDto, rawData);

      expect(dto.is_active).toBe(false);
      expect(dto.is_new).toBe(false);
    });
  });

  describe('Enum Validation', () => {
    it('should fail if invalid sortBy provided', async () => {
      const dto = plainToInstance(SearchPatientDto, { sortBy: 'INVALID_COLUMN' });
      const errors = await validate(dto);
      expect(errors[0].property).toBe('sortBy');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail if invalid sortOrder provided', async () => {
      const dto = plainToInstance(SearchPatientDto, { sortOrder: 'zigzag' });
      const errors = await validate(dto);
      expect(errors[0].property).toBe('sortOrder');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('Date & Range Validation', () => {
    it('should fail if date string format is invalid', async () => {
      const dto = plainToInstance(SearchPatientDto, { tanggal_daftar_dari: '01-01-2023' }); // Wrong format
      const errors = await validate(dto);
      expect(errors[0].property).toBe('tanggal_daftar_dari');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should validate age range constraints', async () => {
      const dto = plainToInstance(SearchPatientDto, { umur_min: -5, umur_max: 200 });
      const errors = await validate(dto);

      const properties = errors.map(e => e.property);
      expect(properties).toContain('umur_min'); // Min 0
      expect(properties).toContain('umur_max'); // Max 150
    });
  });
});