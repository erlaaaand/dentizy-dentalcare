// ============================================================================
// IMPORTS
// ============================================================================
import { validate, ValidationError } from 'class-validator';
import { Match } from '../match.validator';

// ============================================================================
// MOCK DATA
// ============================================================================
class TestMatchDto {
  password: string;

  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  constructor(password: string, confirmPassword: string) {
    this.password = password;
    this.confirmPassword = confirmPassword;
  }
}

class TestUserDto {
  email: string;

  @Match('email')
  confirmEmail: string;

  constructor(email: string, confirmEmail: string) {
    this.email = email;
    this.confirmEmail = confirmEmail;
  }
}

const mockValidMatchData = {
  password: 'Test@1234',
  confirmPassword: 'Test@1234',
};

const mockInvalidMatchData = {
  password: 'Test@1234',
  confirmPassword: 'Different@1234',
};

const mockEmailMatchData = {
  valid: {
    email: 'test@example.com',
    confirmEmail: 'test@example.com',
  },
  invalid: {
    email: 'test@example.com',
    confirmEmail: 'different@example.com',
  },
};

// ============================================================================
// TEST SUITE
// ============================================================================
describe('Match Validator', () => {
  // ==========================================================================
  // SETUP AND TEARDOWN
  // ==========================================================================
  let testDto: TestMatchDto | null;
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
  describe('Match Decorator Functionality', () => {
    it('should validate successfully when values match', async () => {
      // Arrange
      testDto = new TestMatchDto(
        mockValidMatchData.password,
        mockValidMatchData.confirmPassword,
      );

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when values do not match', async () => {
      // Arrange
      testDto = new TestMatchDto(
        mockInvalidMatchData.password,
        mockInvalidMatchData.confirmPassword,
      );

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('confirmPassword');
      expect(errors[0].constraints).toHaveProperty('match');
    });

    it('should use custom validation message when provided', async () => {
      // Arrange
      testDto = new TestMatchDto(
        mockInvalidMatchData.password,
        mockInvalidMatchData.confirmPassword,
      );

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors[0].constraints?.match).toBe('Passwords do not match');
    });

    it('should use default validation message when not provided', async () => {
      // Arrange
      const emailDto = new TestUserDto(
        mockEmailMatchData.invalid.email,
        mockEmailMatchData.invalid.confirmEmail,
      );

      // Act
      errors = await validate(emailDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.match).toBe('confirmEmail must match email');
    });
  });

  // ==========================================================================
  // SUB-GROUP TESTS
  // ==========================================================================
  describe('Edge Cases', () => {
    it('should handle empty strings matching', async () => {
      // Arrange
      testDto = new TestMatchDto('', '');

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should handle null values not matching', async () => {
      // Arrange
      const dto = new TestMatchDto('', 'Test@1234');
      (dto as any).password = null;

      // Act
      errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('confirmPassword');
    });

    it('should handle undefined values not matching', async () => {
      // Arrange
      const dto = new TestMatchDto('', 'Test@1234');
      (dto as any).password = undefined;

      // Act
      errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('confirmPassword');
    });

    it('should handle both null values matching', async () => {
      // Arrange
      const dto = new TestMatchDto('', '');
      (dto as any).password = null;
      (dto as any).confirmPassword = null;

      // Act
      errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should handle both undefined values matching', async () => {
      // Arrange
      const dto = new TestMatchDto('', '');
      (dto as any).password = undefined;
      (dto as any).confirmPassword = undefined;

      // Act
      errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });

  describe('Different Data Types', () => {
    it('should validate email fields matching', async () => {
      // Arrange
      const emailDto = new TestUserDto(
        mockEmailMatchData.valid.email,
        mockEmailMatchData.valid.confirmEmail,
      );

      // Act
      errors = await validate(emailDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail when email fields do not match', async () => {
      // Arrange
      const emailDto = new TestUserDto(
        mockEmailMatchData.invalid.email,
        mockEmailMatchData.invalid.confirmEmail,
      );

      // Act
      errors = await validate(emailDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('confirmEmail');
    });

    it('should handle numeric string values', async () => {
      // Arrange
      class TestNumericDto {
        pin: string;
        @Match('pin')
        confirmPin: string;
      }
      const numericDto = new TestNumericDto();
      numericDto.pin = '123456';
      numericDto.confirmPin = '123456';

      // Act
      errors = await validate(numericDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should be case-sensitive for string matching', async () => {
      // Arrange
      testDto = new TestMatchDto('Test@1234', 'test@1234');

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('confirmPassword');
    });
  });

  describe('Whitespace Handling', () => {
    it('should not trim whitespace - exact match required', async () => {
      // Arrange
      testDto = new TestMatchDto('Test@1234', ' Test@1234');

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('confirmPassword');
    });

    it('should match when both have same whitespace', async () => {
      // Arrange
      testDto = new TestMatchDto(' Test@1234 ', ' Test@1234 ');

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should not match with trailing whitespace difference', async () => {
      // Arrange
      testDto = new TestMatchDto('Test@1234', 'Test@1234 ');

      // Act
      errors = await validate(testDto);

      // Assert
      expect(errors).toHaveLength(1);
    });
  });

  describe('Multiple Validations', () => {
    it('should work with multiple Match decorators in same class', async () => {
      // Arrange
      class TestMultipleMatchDto {
        password: string;
        @Match('password')
        confirmPassword: string;

        email: string;
        @Match('email')
        confirmEmail: string;
      }

      const multiDto = new TestMultipleMatchDto();
      multiDto.password = 'Test@1234';
      multiDto.confirmPassword = 'Test@1234';
      multiDto.email = 'test@example.com';
      multiDto.confirmEmail = 'test@example.com';

      // Act
      errors = await validate(multiDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should report multiple validation errors independently', async () => {
      // Arrange
      class TestMultipleMatchDto {
        password: string;
        @Match('password')
        confirmPassword: string;

        email: string;
        @Match('email')
        confirmEmail: string;
      }

      const multiDto = new TestMultipleMatchDto();
      multiDto.password = 'Test@1234';
      multiDto.confirmPassword = 'Different@1234';
      multiDto.email = 'test@example.com';
      multiDto.confirmEmail = 'different@example.com';

      // Act
      errors = await validate(multiDto);

      // Assert
      expect(errors).toHaveLength(2);
      expect(errors.map(e => e.property)).toContain('confirmPassword');
      expect(errors.map(e => e.property)).toContain('confirmEmail');
    });
  });
});