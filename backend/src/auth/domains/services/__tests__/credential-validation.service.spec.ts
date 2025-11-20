// backend/src/auth/domains/services/__tests__/credential-validation.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CredentialValidationService } from '../credential-validation.service';

// ======================
// TEST SUITE
// ======================
describe('CredentialValidationService', () => {
  let service: CredentialValidationService;

  // ======================
  // SETUP AND TEARDOWN
  // ======================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CredentialValidationService],
    }).compile();

    service = module.get<CredentialValidationService>(CredentialValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ======================
  // validateUsername METHOD TESTS
  // ======================
  describe('validateUsername', () => {
    describe('Valid Username', () => {
      it('should accept valid username', () => {
        const result = service.validateUsername('testuser');

        expect(result.valid).toBe(true);
        expect(result.message).toBeUndefined();
      });

      it('should accept username with minimum length', () => {
        const result = service.validateUsername('abc');

        expect(result.valid).toBe(true);
      });

      it('should accept username with maximum length', () => {
        const result = service.validateUsername('a'.repeat(50));

        expect(result.valid).toBe(true);
      });

      it('should accept username with numbers', () => {
        const result = service.validateUsername('user123');

        expect(result.valid).toBe(true);
      });

      it('should accept username with underscore', () => {
        const result = service.validateUsername('test_user');

        expect(result.valid).toBe(true);
      });

      it('should accept username with mixed case', () => {
        const result = service.validateUsername('TestUser');

        expect(result.valid).toBe(true);
      });
    });

    describe('Invalid Username', () => {
      it('should reject empty username', () => {
        const result = service.validateUsername('');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Username tidak boleh kosong');
      });

      it('should reject username with only whitespace', () => {
        const result = service.validateUsername('   ');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Username tidak boleh kosong');
      });

      it('should reject username shorter than minimum length', () => {
        const result = service.validateUsername('ab');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Username minimal 3 karakter');
      });

      it('should reject username longer than maximum length', () => {
        const result = service.validateUsername('a'.repeat(51));

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Username maksimal 50 karakter');
      });

      it('should reject username with special characters', () => {
        const result = service.validateUsername('test@user');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Username hanya boleh mengandung huruf, angka, dan underscore');
      });

      it('should reject username with spaces', () => {
        const result = service.validateUsername('test user');

        expect(result.valid).toBe(false);
        expect(result.message).toContain('Username hanya boleh mengandung');
      });

      it('should reject username with dash', () => {
        const result = service.validateUsername('test-user');

        expect(result.valid).toBe(false);
      });

      it('should reject username with dot', () => {
        const result = service.validateUsername('test.user');

        expect(result.valid).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle null username', () => {
        const result = service.validateUsername(null as any);

        expect(result.valid).toBe(false);
      });

      it('should handle undefined username', () => {
        const result = service.validateUsername(undefined as any);

        expect(result.valid).toBe(false);
      });

      it('should trim whitespace before validation', () => {
        const result = service.validateUsername('   testuser   ');

        expect(result.valid).toBe(true);
      });
    });
  });

  // ======================
  // validatePasswordFormat METHOD TESTS
  // ======================
  describe('validatePasswordFormat', () => {
    describe('Valid Password', () => {
      it('should accept valid password', () => {
        const result = service.validatePasswordFormat('Password123!');

        expect(result.valid).toBe(true);
        expect(result.message).toBeUndefined();
      });

      it('should accept password with minimum length', () => {
        const result = service.validatePasswordFormat('12345678');

        expect(result.valid).toBe(true);
      });

      it('should accept very long password', () => {
        const result = service.validatePasswordFormat('a'.repeat(1000));

        expect(result.valid).toBe(true);
      });

      it('should accept password with special characters', () => {
        const result = service.validatePasswordFormat('Pass@#$%^&*()');

        expect(result.valid).toBe(true);
      });

      it('should accept password with spaces', () => {
        const result = service.validatePasswordFormat('Pass word 123');

        expect(result.valid).toBe(true);
      });
    });

    describe('Invalid Password', () => {
      it('should reject empty password', () => {
        const result = service.validatePasswordFormat('');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Password tidak boleh kosong');
      });

      it('should reject password shorter than minimum length', () => {
        const result = service.validatePasswordFormat('1234567');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('Password minimal 8 karakter');
      });

      it('should reject null password', () => {
        const result = service.validatePasswordFormat(null as any);

        expect(result.valid).toBe(false);
      });

      it('should reject undefined password', () => {
        const result = service.validatePasswordFormat(undefined as any);

        expect(result.valid).toBe(false);
      });
    });
  });

  // ======================
  // validateCredentials METHOD TESTS
  // ======================
  describe('validateCredentials', () => {
    describe('Valid Credentials', () => {
      it('should accept valid username and password', () => {
        const result = service.validateCredentials('testuser', 'Password123!');

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should return empty errors array for valid credentials', () => {
        const result = service.validateCredentials('validuser', '12345678');

        expect(result.errors).toEqual([]);
      });
    });

    describe('Invalid Credentials', () => {
      it('should reject both invalid username and password', () => {
        const result = service.validateCredentials('ab', '1234');

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(2);
      });

      it('should collect username error', () => {
        const result = service.validateCredentials('ab', 'ValidPassword123');

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Username minimal 3 karakter');
      });

      it('should collect password error', () => {
        const result = service.validateCredentials('validuser', '1234');

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password minimal 8 karakter');
      });

      it('should collect both errors', () => {
        const result = service.validateCredentials('', '');

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors).toContain('Username tidak boleh kosong');
        expect(result.errors).toContain('Password tidak boleh kosong');
      });

      it('should reject invalid username format', () => {
        const result = service.validateCredentials('test@user', 'ValidPassword123');

        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('Username'))).toBe(true);
      });

      it('should reject short password', () => {
        const result = service.validateCredentials('validuser', 'short');

        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('Password'))).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should handle null values', () => {
        const result = service.validateCredentials(null as any, null as any);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should handle undefined values', () => {
        const result = service.validateCredentials(undefined as any, undefined as any);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should handle mixed null and valid values', () => {
        const result = service.validateCredentials('validuser', null as any);

        expect(result.valid).toBe(false);
      });

      it('should handle whitespace-only values', () => {
        const result = service.validateCredentials('   ', '   ');

        expect(result.valid).toBe(false);
      });
    });

    describe('Error Message Aggregation', () => {
      it('should aggregate all validation errors', () => {
        const result = service.validateCredentials('x', 'y');

        expect(result.errors).toBeDefined();
        expect(Array.isArray(result.errors)).toBe(true);
      });

      it('should not include duplicate error messages', () => {
        const result = service.validateCredentials('ab', '123');

        const uniqueErrors = new Set(result.errors);
        expect(uniqueErrors.size).toBe(result.errors.length);
      });
    });
  });
});