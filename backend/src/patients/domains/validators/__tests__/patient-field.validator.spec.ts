// __tests__/domains/validators/patient-field.validator.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PatientFieldValidator } from '../../../domains/validators/patient-field.validator';

// 2. MOCK DATA
// const validPhone = '081234567890';
const validEmail = 'test@example.com';
const validNik = '1234567890123456';

// Helper untuk dynamic date
const getFutureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
};

const getAncientDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 151);
  return d;
};

// 3. TEST SUITE
describe('PatientFieldValidator', () => {
  let validator: PatientFieldValidator;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientFieldValidator],
    }).compile();

    validator = module.get<PatientFieldValidator>(PatientFieldValidator);
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS & 6. SUB-GROUP TESTS

  describe('validateAgeRange', () => {
    it('should pass when minAge <= maxAge', () => {
      expect(() => validator.validateAgeRange(10, 20)).not.toThrow();
      expect(() => validator.validateAgeRange(10, 10)).not.toThrow();
    });

    it('should throw BadRequestException if minAge > maxAge', () => {
      expect(() => validator.validateAgeRange(20, 10)).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateAgeRange(20, 10)).toThrow(
        /Umur minimal tidak boleh lebih besar/,
      );
    });

    it('should throw BadRequestException if age is negative', () => {
      expect(() => validator.validateAgeRange(-1, 10)).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateAgeRange(10, -1)).toThrow(
        /Umur minimal tidak boleh lebih besar dari umur maksimal/,
      );
    });

    it('should throw BadRequestException if age > 150', () => {
      expect(() => validator.validateAgeRange(0, 151)).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateAgeRange(151, 200)).toThrow(
        /maksimal 150/,
      );
    });

    it('should ignore validation if values are undefined', () => {
      expect(() => validator.validateAgeRange(undefined, 10)).not.toThrow();
      expect(() => validator.validateAgeRange(10, undefined)).not.toThrow();
    });
  });

  describe('validateBirthDate', () => {
    it('should pass for valid past date', () => {
      const validDate = new Date('2000-01-01');
      expect(() => validator.validateBirthDate(validDate)).not.toThrow();
    });

    it('should handle string input correctly', () => {
      expect(() => validator.validateBirthDate('1990-01-01')).not.toThrow();
    });

    it('should throw BadRequestException for invalid date string', () => {
      expect(() => validator.validateBirthDate('invalid-date')).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for future date', () => {
      const futureDate = getFutureDate();
      expect(() => validator.validateBirthDate(futureDate)).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateBirthDate(futureDate)).toThrow(
        /masa depan/,
      );
    });

    it('should throw BadRequestException for ancient date (> 150 years ago)', () => {
      const ancientDate = getAncientDate();
      expect(() => validator.validateBirthDate(ancientDate)).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateBirthDate(ancientDate)).toThrow(
        /lebih dari 150 tahun/,
      );
    });
  });

  describe('validatePhoneNumber', () => {
    it('should pass for valid Indonesian numbers', () => {
      expect(() => validator.validatePhoneNumber('08123456789')).not.toThrow();
      expect(() => validator.validatePhoneNumber('628123456789')).not.toThrow();
      expect(() =>
        validator.validatePhoneNumber('+628123456789'),
      ).not.toThrow();
    });

    it('should throw BadRequestException for invalid format', () => {
      expect(() => validator.validatePhoneNumber('123')).toThrow(
        BadRequestException,
      ); // Too short
      expect(() => validator.validatePhoneNumber('0812abc')).toThrow(
        BadRequestException,
      ); // Letters
    });

    it('should throw BadRequestException for repeated digits (spam/fake number)', () => {
      // Pattern: (\d)\1{9,} -> 1 digit repeated 10 times or more
      const fakeNumber = '081111111111';
      expect(() => validator.validatePhoneNumber(fakeNumber)).toThrow(
        BadRequestException,
      );
      expect(() => validator.validatePhoneNumber(fakeNumber)).toThrow(
        /terlalu banyak digit yang sama/,
      );
    });
  });

  describe('validateEmail', () => {
    it('should pass for valid email', () => {
      expect(() => validator.validateEmail(validEmail)).not.toThrow();
    });

    it('should throw BadRequestException for invalid format', () => {
      expect(() => validator.validateEmail('budi@')).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateEmail('budi.com')).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if length exceeds 250', () => {
      const longEmail = 'a'.repeat(240) + '@example.com'; // Total > 250
      expect(() => validator.validateEmail(longEmail)).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateEmail(longEmail)).toThrow(/maksimal 250/);
    });
  });

  describe('validateNik', () => {
    it('should pass for valid 16-digit numeric NIK', () => {
      expect(() => validator.validateNik(validNik)).not.toThrow();
    });

    it('should throw BadRequestException if length is not 16', () => {
      expect(() => validator.validateNik('123')).toThrow(BadRequestException);
      expect(() => validator.validateNik('1'.repeat(17))).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if contains non-numeric', () => {
      // 16 chars but with letters
      const invalidNik = '123456789012345a';
      expect(() => validator.validateNik(invalidNik)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateTextLength', () => {
    it('should pass if text is within limit', () => {
      expect(() =>
        validator.validateTextLength('abc', 'Field', 5),
      ).not.toThrow();
    });

    it('should throw BadRequestException if text exceeds limit', () => {
      expect(() => validator.validateTextLength('abcdef', 'Nama', 5)).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateTextLength('abcdef', 'Nama', 5)).toThrow(
        /Nama maksimal 5 karakter/,
      );
    });
  });

  describe('validateRequired', () => {
    it('should pass if value is present', () => {
      expect(() =>
        validator.validateRequired('some value', 'Field'),
      ).not.toThrow();
      expect(() => validator.validateRequired(123, 'Field')).not.toThrow();
      expect(() => validator.validateRequired(false, 'Field')).not.toThrow(); // false is a value
    });

    it('should throw BadRequestException if value is undefined', () => {
      expect(() => validator.validateRequired(undefined, 'Alamat')).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if value is null', () => {
      expect(() => validator.validateRequired(null, 'Alamat')).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if value is empty string', () => {
      expect(() => validator.validateRequired('', 'Alamat')).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateRequired('', 'Alamat')).toThrow(
        /Alamat harus diisi/,
      );
    });
  });
});
