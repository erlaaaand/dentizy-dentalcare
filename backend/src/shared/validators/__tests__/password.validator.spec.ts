// ============================================================================
// IMPORTS
// ============================================================================
import { validate, ValidationError } from 'class-validator';
import {
  PASSWORD_REGEX,
  PASSWORD_VALIDATION_MESSAGE,
  PASSWORD_MIN_LENGTH,
  validatePasswordStrength,
  IsStrongPassword,
} from '../password.validator';

// ============================================================================
// MOCK DATA
// ============================================================================
class TestPasswordDto {
  @IsStrongPassword()
  password: string;

  constructor(password: string) {
    this.password = password;
  }
}

class TestPasswordWithCustomMessageDto {
  @IsStrongPassword({ message: 'Custom password error message' })
  password: string;

  constructor(password: string) {
    this.password = password;
  }
}

const mockValidPasswords = [
  'Test@1234',
  'Abcd@123',
  'MyP@ssw0rd',
  'Secure#2024',
  'C0mpl3x!Pass',
  'Val1d@Password',
  'Str0ng&Pass',
  'G00d!Choice',
];

const mockInvalidPasswords = {
  tooShort: 'Te@1',
  noUppercase: 'test@1234',
  noLowercase: 'TEST@1234',
  noDigit: 'Test@abcd',
  noSpecialChar: 'Test1234',
  onlyLetters: 'TestPassword',
  onlyNumbers: '12345678',
  empty: '',
  whitespace: 'Test @123',
  missingMultiple: 'test123',
};

// ============================================================================
// TEST SUITE
// ============================================================================
describe('Password Validator', () => {
  // ==========================================================================
  // SETUP AND TEARDOWN
  // ==========================================================================
  let testDto: TestPasswordDto | null;
  let errors: ValidationError[];

  beforeEach(() => {
    testDto = null;
    errors = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // EXECUTE METHOD TESTS
  // ==========================================================================
  describe('PASSWORD_REGEX Constant', () => {
    it('should be defined and be a RegExp', () => {
      expect(PASSWORD_REGEX).toBeDefined();
      expect(PASSWORD_REGEX).toBeInstanceOf(RegExp);
    });

    it('should validate correct password format', () => {
      mockValidPasswords.forEach((password) => {
        expect(PASSWORD_REGEX.test(password)).toBe(true);
      });
    });

    it('should reject passwords without uppercase letters', () => {
      expect(PASSWORD_REGEX.test(mockInvalidPasswords.noUppercase)).toBe(false);
    });

    it('should reject passwords without lowercase letters', () => {
      expect(PASSWORD_REGEX.test(mockInvalidPasswords.noLowercase)).toBe(false);
    });

    it('should reject passwords without digits', () => {
      expect(PASSWORD_REGEX.test(mockInvalidPasswords.noDigit)).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      expect(PASSWORD_REGEX.test(mockInvalidPasswords.noSpecialChar)).toBe(false);
    });

    it('should reject passwords that are too short', () => {
      expect(PASSWORD_REGEX.test(mockInvalidPasswords.tooShort)).toBe(false);
    });
  });

  describe('PASSWORD_VALIDATION_MESSAGE Constant', () => {
    it('should be defined and contain required information', () => {
      expect(PASSWORD_VALIDATION_MESSAGE).toBeDefined();
      expect(PASSWORD_VALIDATION_MESSAGE).toContain('minimal 8 karakter');
      expect(PASSWORD_VALIDATION_MESSAGE).toContain('huruf besar');
      expect(PASSWORD_VALIDATION_MESSAGE).toContain('huruf kecil');
      expect(PASSWORD_VALIDATION_MESSAGE).toContain('angka');
      expect(PASSWORD_VALIDATION_MESSAGE).toContain('karakter khusus');
    });
  });

  describe('PASSWORD_MIN_LENGTH Constant', () => {
    it('should be defined and equal to 8', () => {
      expect(PASSWORD_MIN_LENGTH).toBeDefined();
      expect(PASSWORD_MIN_LENGTH).toBe(8);
    });
  });

  describe('validatePasswordStrength Function', () => {
    it('should return valid result for strong passwords', () => {
      mockValidPasswords.forEach((password) => {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should return error for password too short', () => {
      const result = validatePasswordStrength(mockInvalidPasswords.tooShort);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password minimal 8 karakter');
    });

    it('should return error for password without lowercase', () => {
      const result = validatePasswordStrength(mockInvalidPasswords.noLowercase);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password harus mengandung minimal satu huruf kecil');
    });

    it('should return error for password without uppercase', () => {
      const result = validatePasswordStrength(mockInvalidPasswords.noUppercase);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password harus mengandung minimal satu huruf besar');
    });

    it('should return error for password without digit', () => {
      const result = validatePasswordStrength(mockInvalidPasswords.noDigit);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password harus mengandung minimal satu angka');
    });

    it('should return error for password without special character', () => {
      const result = validatePasswordStrength(mockInvalidPasswords.noSpecialChar);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password harus mengandung minimal satu karakter khusus (@$!%*?&#)',
      );
    });

    it('should return multiple errors for password missing multiple requirements', () => {
      const result = validatePasswordStrength(mockInvalidPasswords.missingMultiple);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should handle empty string', () => {
      const result = validatePasswordStrength(mockInvalidPasswords.empty);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('IsStrongPassword Decorator', () => {
    it('should validate successfully with strong password', async () => {
      // Arrange
      testDto = new TestPasswordDto('Test@1234');

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with weak password', async () => {
      // Arrange
      testDto = new TestPasswordDto(mockInvalidPasswords.noUppercase);

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isStrongPassword');
    });

    it('should use default validation message', async () => {
      // Arrange
      testDto = new TestPasswordDto(mockInvalidPasswords.tooShort);

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors[0].constraints?.isStrongPassword).toBe(PASSWORD_VALIDATION_MESSAGE);
    });

    it('should use custom validation message when provided', async () => {
      // Arrange
      const customDto = new TestPasswordWithCustomMessageDto(mockInvalidPasswords.tooShort);

      // Act
      errors = await validate(customDto);

      // Assert
      expect(errors[0].constraints?.isStrongPassword).toBe('Custom password error message');
    });

    it('should reject non-string values', async () => {
      // Arrange
      const dto = new TestPasswordDto('');
      (dto as any).password = null;

      // Act
      errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });
  });

  // ==========================================================================
  // SUB-GROUP TESTS
  // ==========================================================================
  describe('Edge Cases', () => {
    it('should handle null value', async () => {
      // Arrange
      const dto = new TestPasswordDto('');
      (dto as any).password = null;

      // Act
      errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
    });

    it('should handle undefined value', async () => {
      // Arrange
      const dto = new TestPasswordDto('');
      (dto as any).password = undefined;

      // Act
      errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
    });

    it('should handle empty string', async () => {
      // Arrange
      testDto = new TestPasswordDto('');

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(1);
    });

    it('should handle numeric input', async () => {
      // Arrange
      testDto = new TestPasswordDto(12345678 as any);

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(1);
    });

    it('should handle object input', async () => {
      // Arrange
      testDto = new TestPasswordDto({} as any);

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(1);
    });

    it('should handle array input', async () => {
      // Arrange
      testDto = new TestPasswordDto([] as any);

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(1);
    });
  });

  describe('Special Characters Validation', () => {
    it('should accept @ symbol', async () => {
      testDto = new TestPasswordDto('Test@1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept $ symbol', async () => {
      testDto = new TestPasswordDto('Test$1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept ! symbol', async () => {
      testDto = new TestPasswordDto('Test!1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept % symbol', async () => {
      testDto = new TestPasswordDto('Test%1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept * symbol', async () => {
      testDto = new TestPasswordDto('Test*1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept ? symbol', async () => {
      testDto = new TestPasswordDto('Test?1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept & symbol', async () => {
      testDto = new TestPasswordDto('Test&1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept # symbol', async () => {
      testDto = new TestPasswordDto('Test#1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should reject other special characters', async () => {
      const invalidSpecialChars = ['Test^1234', 'Test+1234', 'Test=1234', 'Test-1234'];
      
      for (const password of invalidSpecialChars) {
        testDto = new TestPasswordDto(password);
        errors = await validate(testDto);
        expect(errors).toHaveLength(1);
      }
    });
  });

  describe('Length Validation', () => {
    it('should reject password with exactly 7 characters', async () => {
      testDto = new TestPasswordDto('Te@1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(1);
    });

    it('should accept password with exactly 8 characters', async () => {
      testDto = new TestPasswordDto('Test@123');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept password with more than 8 characters', async () => {
      testDto = new TestPasswordDto('Test@1234567890');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept very long password', async () => {
      testDto = new TestPasswordDto('Test@1234567890' + 'A'.repeat(100));
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Case Sensitivity', () => {
    it('should require at least one lowercase letter', async () => {
      testDto = new TestPasswordDto('TEST@1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(1);
    });

    it('should require at least one uppercase letter', async () => {
      testDto = new TestPasswordDto('test@1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(1);
    });

    it('should accept mixed case', async () => {
      testDto = new TestPasswordDto('TeSt@1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('should validate password with all requirements at minimum', async () => {
      testDto = new TestPasswordDto('Aa1@aaaa');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should validate password with multiple special characters', async () => {
      testDto = new TestPasswordDto('Test@#$%1234');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should validate password with multiple uppercase letters', async () => {
      testDto = new TestPasswordDto('TEST@test1');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should validate password with multiple digits', async () => {
      testDto = new TestPasswordDto('Test@123456789');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });

    it('should accept password with whitespace (current regex allows it)', async () => {
      // Note: Current PASSWORD_REGEX does not restrict whitespace
      // If whitespace should be rejected, the regex needs to be updated
      testDto = new TestPasswordDto('Test @123');
      errors = await validate(testDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validatePasswordStrength Error Messages', () => {
    it('should return all error messages for completely invalid password', () => {
      const result = validatePasswordStrength('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });

    it('should return specific errors only for missing requirements', () => {
      const result = validatePasswordStrength('TestPassword');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password harus mengandung minimal satu angka');
      expect(result.errors).toContain(
        'Password harus mengandung minimal satu karakter khusus (@$!%*?&#)',
      );
      expect(result.errors).not.toContain('Password minimal 8 karakter');
      expect(result.errors).not.toContain('Password harus mengandung minimal satu huruf kecil');
      expect(result.errors).not.toContain('Password harus mengandung minimal satu huruf besar');
    });
  });
});