// backend/src/auth/domains/validators/__tests__/credential.validator.spec.ts
import { BadRequestException } from '@nestjs/common';
import { CredentialValidator } from '../credential.validator';

// ======================
// TEST SUITE
// ======================
describe('CredentialValidator', () => {
  it('should be defined', () => {
    expect(CredentialValidator).toBeDefined();
  });

  // ======================
  // validateUsername METHOD TESTS
  // ======================
  describe('validateUsername', () => {
    describe('Valid Username', () => {
      it('should accept and return valid username', () => {
        const result = CredentialValidator.validateUsername('testuser');

        expect(result).toBe('testuser');
      });

      it('should trim and lowercase username', () => {
        const result = CredentialValidator.validateUsername('  TestUser  ');

        expect(result).toBe('testuser');
      });

      it('should accept username with minimum length', () => {
        const result = CredentialValidator.validateUsername('abc');

        expect(result).toBe('abc');
      });

      it('should accept username with maximum length', () => {
        const username = 'a'.repeat(50);
        const result = CredentialValidator.validateUsername(username);

        expect(result).toBe(username);
      });

      it('should accept username with numbers', () => {
        const result = CredentialValidator.validateUsername('user123');

        expect(result).toBe('user123');
      });

      it('should accept username with underscore', () => {
        const result = CredentialValidator.validateUsername('test_user');

        expect(result).toBe('test_user');
      });

      it('should accept username with mixed alphanumeric', () => {
        const result = CredentialValidator.validateUsername('user_123_test');

        expect(result).toBe('user_123_test');
      });

      it('should convert uppercase to lowercase', () => {
        const result = CredentialValidator.validateUsername('TESTUSER');

        expect(result).toBe('testuser');
      });

      it('should handle mixed case correctly', () => {
        const result = CredentialValidator.validateUsername('TestUser123');

        expect(result).toBe('testuser123');
      });
    });

    describe('Invalid Username', () => {
      it('should throw error for empty username', () => {
        expect(() => CredentialValidator.validateUsername('')).toThrow(
          BadRequestException,
        );
        expect(() => CredentialValidator.validateUsername('')).toThrow(
          'Username is required',
        );
      });

      it('should throw error for null username', () => {
        expect(() => CredentialValidator.validateUsername(null as any)).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for undefined username', () => {
        expect(() => CredentialValidator.validateUsername(undefined as any)).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for username with only whitespace', () => {
        expect(() => CredentialValidator.validateUsername('   ')).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for username shorter than 3 characters', () => {
        expect(() => CredentialValidator.validateUsername('ab')).toThrow(
          BadRequestException,
        );
        expect(() => CredentialValidator.validateUsername('ab')).toThrow(
          'Username must be at least 3 characters',
        );
      });

      it('should throw error for username longer than 50 characters', () => {
        const longUsername = 'a'.repeat(51);
        expect(() => CredentialValidator.validateUsername(longUsername)).toThrow(
          BadRequestException,
        );
        expect(() => CredentialValidator.validateUsername(longUsername)).toThrow(
          'Username must not exceed 50 characters',
        );
      });

      it('should throw error for username with special characters', () => {
        expect(() => CredentialValidator.validateUsername('test@user')).toThrow(
          BadRequestException,
        );
        expect(() => CredentialValidator.validateUsername('test@user')).toThrow(
          'Username can only contain lowercase letters, numbers, and underscores',
        );
      });

      it('should throw error for username with spaces', () => {
        expect(() => CredentialValidator.validateUsername('test user')).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for username with dash', () => {
        expect(() => CredentialValidator.validateUsername('test-user')).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for username with dot', () => {
        expect(() => CredentialValidator.validateUsername('test.user')).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for username with hash', () => {
        expect(() => CredentialValidator.validateUsername('test#user')).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for username with at symbol', () => {
        expect(() => CredentialValidator.validateUsername('test@user')).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for username with exclamation mark', () => {
        expect(() => CredentialValidator.validateUsername('test!user')).toThrow(
          BadRequestException,
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle username with leading/trailing spaces', () => {
        const result = CredentialValidator.validateUsername('  testuser  ');

        expect(result).toBe('testuser');
      });

      it('should handle username with multiple underscores', () => {
        const result = CredentialValidator.validateUsername('test___user');

        expect(result).toBe('test___user');
      });

      it('should handle username starting with number', () => {
        const result = CredentialValidator.validateUsername('123user');

        expect(result).toBe('123user');
      });

      it('should handle username ending with number', () => {
        const result = CredentialValidator.validateUsername('user123');

        expect(result).toBe('user123');
      });

      it('should handle username starting with underscore', () => {
        const result = CredentialValidator.validateUsername('_user');

        expect(result).toBe('_user');
      });

      it('should handle username ending with underscore', () => {
        const result = CredentialValidator.validateUsername('user_');

        expect(result).toBe('user_');
      });

      it('should handle all numeric username', () => {
        const result = CredentialValidator.validateUsername('123456');

        expect(result).toBe('123456');
      });

      it('should handle all underscore username', () => {
        const result = CredentialValidator.validateUsername('___');

        expect(result).toBe('___');
      });
    });
  });

  // ======================
  // validatePassword METHOD TESTS
  // ======================
  describe('validatePassword', () => {
    describe('Valid Password', () => {
      it('should accept valid password', () => {
        expect(() =>
          CredentialValidator.validatePassword('Password123!'),
        ).not.toThrow();
      });

      it('should accept password with minimum length', () => {
        expect(() =>
          CredentialValidator.validatePassword('12345678'),
        ).not.toThrow();
      });

      it('should accept very long password', () => {
        const longPassword = 'a'.repeat(1000);
        expect(() =>
          CredentialValidator.validatePassword(longPassword),
        ).not.toThrow();
      });

      it('should accept password with special characters', () => {
        expect(() =>
          CredentialValidator.validatePassword('Pass@#$%^&*()'),
        ).not.toThrow();
      });

      it('should accept password with spaces', () => {
        expect(() =>
          CredentialValidator.validatePassword('Pass word 123'),
        ).not.toThrow();
      });

      it('should accept password with all character types', () => {
        expect(() =>
          CredentialValidator.validatePassword('Abc123!@#'),
        ).not.toThrow();
      });

      it('should accept password with only letters', () => {
        expect(() =>
          CredentialValidator.validatePassword('abcdefgh'),
        ).not.toThrow();
      });

      it('should accept password with only numbers', () => {
        expect(() =>
          CredentialValidator.validatePassword('12345678'),
        ).not.toThrow();
      });
    });

    describe('Invalid Password', () => {
      it('should throw error for empty password', () => {
        expect(() => CredentialValidator.validatePassword('')).toThrow(
          BadRequestException,
        );
        expect(() => CredentialValidator.validatePassword('')).toThrow(
          'Password is required',
        );
      });

      it('should throw error for null password', () => {
        expect(() =>
          CredentialValidator.validatePassword(null as any),
        ).toThrow(BadRequestException);
      });

      it('should throw error for undefined password', () => {
        expect(() =>
          CredentialValidator.validatePassword(undefined as any),
        ).toThrow(BadRequestException);
      });

      it('should throw error for password shorter than 8 characters', () => {
        expect(() => CredentialValidator.validatePassword('1234567')).toThrow(
          BadRequestException,
        );
        expect(() => CredentialValidator.validatePassword('1234567')).toThrow(
          'Password must be at least 8 characters',
        );
      });

      it('should throw error for 7 character password', () => {
        expect(() => CredentialValidator.validatePassword('Pass123')).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for single character', () => {
        expect(() => CredentialValidator.validatePassword('a')).toThrow(
          BadRequestException,
        );
      });

      it('should throw error for 5 character password', () => {
        expect(() => CredentialValidator.validatePassword('12345')).toThrow(
          BadRequestException,
        );
      });
    });

    describe('Edge Cases', () => {
      it('should accept exactly 8 characters', () => {
        expect(() =>
          CredentialValidator.validatePassword('abcdefgh'),
        ).not.toThrow();
      });

      it('should accept password with newlines', () => {
        expect(() =>
          CredentialValidator.validatePassword('pass\nword'),
        ).not.toThrow();
      });

      it('should accept password with tabs', () => {
        expect(() =>
          CredentialValidator.validatePassword('pass\tword'),
        ).not.toThrow();
      });

      it('should accept password with unicode characters', () => {
        expect(() =>
          CredentialValidator.validatePassword('pässwörd'),
        ).not.toThrow();
      });

      it('should accept password with emojis', () => {
        expect(() =>
          CredentialValidator.validatePassword('pass😀word'),
        ).not.toThrow();
      });
    });
  });

  // ======================
  // INTEGRATION TESTS
  // ======================
  describe('Integration Scenarios', () => {
    it('should validate username and password separately', () => {
      const username = CredentialValidator.validateUsername('testuser');
      expect(() =>
        CredentialValidator.validatePassword('Password123!'),
      ).not.toThrow();

      expect(username).toBe('testuser');
    });

    it('should handle valid credentials', () => {
      const username = CredentialValidator.validateUsername('validuser');
      expect(() =>
        CredentialValidator.validatePassword('ValidPass123'),
      ).not.toThrow();

      expect(username).toBe('validuser');
    });

    it('should throw for invalid username but valid password', () => {
      expect(() => CredentialValidator.validateUsername('ab')).toThrow();
      expect(() =>
        CredentialValidator.validatePassword('ValidPass123'),
      ).not.toThrow();
    });

    it('should throw for valid username but invalid password', () => {
      const username = CredentialValidator.validateUsername('validuser');
      expect(username).toBe('validuser');
      expect(() => CredentialValidator.validatePassword('short')).toThrow();
    });

    it('should handle both invalid credentials', () => {
      expect(() => CredentialValidator.validateUsername('ab')).toThrow();
      expect(() => CredentialValidator.validatePassword('short')).toThrow();
    });
  });
});