// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PatientSearchValidator } from '../../../domains/validators/patient-search.validator'; // Adjust path
import { SearchPatientDto } from '../../../application/dto/search-patient.dto';

// 2. MOCK DATA
const validBaseQuery: SearchPatientDto = {
  page: 1,
  limit: 10,
  search: 'John Doe',
  umur_min: 20,
  umur_max: 30,
  tanggal_daftar_dari: '2023-01-01',
  tanggal_daftar_sampai: '2023-12-31',
};

// Helper for dynamic dates
const getPastDate = (years: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

// 3. TEST SUITE
describe('PatientSearchValidator', () => {
  let validator: PatientSearchValidator;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientSearchValidator],
    }).compile();

    validator = module.get<PatientSearchValidator>(PatientSearchValidator);
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS (Happy Path)

  describe('validate (General)', () => {
    it('should pass for a fully populated valid query', () => {
      expect(() => validator.validate(validBaseQuery)).not.toThrow();
    });

    it('should pass for an empty/undefined query (all fields optional)', () => {
      const emptyQuery: SearchPatientDto = {};
      expect(() => validator.validate(emptyQuery)).not.toThrow();
    });
  });

  // 6. SUB-GROUP TESTS (Specific Logic Branches)

  describe('validateAgeRange', () => {
    it('should throw BadRequestException if minAge > maxAge', () => {
      const query = { ...validBaseQuery, umur_min: 30, umur_max: 20 };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(
        /Umur minimal tidak boleh lebih besar/,
      );
    });

    it('should throw BadRequestException if age is negative', () => {
      const query = { ...validBaseQuery, umur_min: -1 };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(/negatif/);
    });

    it('should throw BadRequestException if age > 150', () => {
      const query = { ...validBaseQuery, umur_max: 151 };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(/maksimal 150/);
    });
  });

  describe('validateDateRange', () => {
    it('should throw BadRequestException if date format is invalid', () => {
      const query = { ...validBaseQuery, tanggal_daftar_dari: 'invalid-date' };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(
        /Format tanggal tidak valid/,
      );
    });

    it('should throw BadRequestException if From Date > To Date', () => {
      const query = {
        ...validBaseQuery,
        tanggal_daftar_dari: '2023-12-31',
        tanggal_daftar_sampai: '2023-01-01',
      };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(
        /Tanggal dari tidak boleh lebih besar/,
      );
    });

    it('should throw BadRequestException if date is older than 10 years', () => {
      const ancientDate = getPastDate(11); // 11 years ago
      const query = {
        ...validBaseQuery,
        tanggal_daftar_dari: ancientDate,
        tanggal_daftar_sampai: getPastDate(1),
      };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(
        /maksimal 10 tahun ke belakang/,
      );
    });
  });

  describe('validateSearchLength & Security', () => {
    it('should throw BadRequestException if search string is too short (< 2 chars)', () => {
      const query = { ...validBaseQuery, search: 'a' };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(/minimal 2 karakter/);
    });

    it('should throw BadRequestException if search string is too long (> 255 chars)', () => {
      const longString = 'a'.repeat(256);
      const query = { ...validBaseQuery, search: longString };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(/maksimal 255 karakter/);
    });

    it('should detect SQL Injection patterns (Security Check)', () => {
      const dangerousQueries = [
        'SELECT * FROM users',
        'DROP TABLE patients',
        'UNION SELECT 1',
        'admin" --', // Usually caught by special char checks in other validators, but checking the keyword logic here
      ];

      // Note: The regex in your code is /(\bSELECT\b...)/gi, requiring word boundaries
      const sqlQuery = { ...validBaseQuery, search: 'SELECT * FROM' };

      expect(() => validator.validate(sqlQuery)).toThrow(BadRequestException);
      expect(() => validator.validate(sqlQuery)).toThrow(
        /mengandung karakter tidak valid/,
      );
    });

    it('should allow normal names that contain SQL keywords as part of the word', () => {
      // "Selection" contains "Select", but regex uses \b boundaries so it should pass
      const query = { ...validBaseQuery, search: 'Selection Process' };
      expect(() => validator.validate(query)).not.toThrow();
    });
  });

  describe('validatePagination', () => {
    it('should throw BadRequestException if page < 1', () => {
      const query = { ...validBaseQuery, page: 0 };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(
        /Page harus lebih besar dari 0/,
      );
    });

    it('should throw BadRequestException if limit < 1', () => {
      const query = { ...validBaseQuery, limit: 0 };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(
        /Limit harus lebih besar dari 0/,
      );
    });

    it('should throw BadRequestException if limit > 100', () => {
      const query = { ...validBaseQuery, limit: 101 };
      expect(() => validator.validate(query)).toThrow(BadRequestException);
      expect(() => validator.validate(query)).toThrow(/Limit maksimal 100/);
    });
  });
});
