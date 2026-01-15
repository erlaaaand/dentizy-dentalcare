// backend/src/auth/infrastructures/security/__tests__/password-hasher.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHasherService } from '../password-hasher.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

// ======================
// MOCK DATA
// ======================
const mockPlainPassword = 'Password123!';
const mockHashedPassword =
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

// ======================
// TEST SUITE
// ======================
describe('PasswordHasherService', () => {
  let service: PasswordHasherService;

  // ======================
  // SETUP AND TEARDOWN
  // ======================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordHasherService],
    }).compile();

    service = module.get<PasswordHasherService>(PasswordHasherService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ======================
  // hash METHOD TESTS
  // ======================
  describe('hash', () => {
    describe('Successful Hashing', () => {
      beforeEach(() => {
        jest
          .spyOn(bcrypt, 'hash')
          .mockResolvedValue(mockHashedPassword as never);
      });

      it('should hash password successfully', async () => {
        const result = await service.hash(mockPlainPassword);

        expect(result).toBe(mockHashedPassword);
      });

      it('should call bcrypt.hash with correct arguments', async () => {
        await service.hash(mockPlainPassword);

        expect(bcrypt.hash).toHaveBeenCalledWith(mockPlainPassword, 10);
      });

      it('should use 10 salt rounds', async () => {
        await service.hash(mockPlainPassword);

        expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
      });

      it('should return hashed password string', async () => {
        const result = await service.hash(mockPlainPassword);

        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('should hash different passwords differently', async () => {
        jest
          .spyOn(bcrypt, 'hash')
          .mockResolvedValueOnce('hash1' as never)
          .mockResolvedValueOnce('hash2' as never);

        const hash1 = await service.hash('password1');
        const hash2 = await service.hash('password2');

        expect(hash1).not.toBe(hash2);
      });
    });

    describe('Hashing Different Inputs', () => {
      beforeEach(() => {
        jest
          .spyOn(bcrypt, 'hash')
          .mockResolvedValue(mockHashedPassword as never);
      });

      it('should hash simple password', async () => {
        const result = await service.hash('simple123');

        expect(result).toBeDefined();
        expect(bcrypt.hash).toHaveBeenCalled();
      });

      it('should hash complex password', async () => {
        const result = await service.hash('C0mpl3x!P@ssw0rd#2023');

        expect(result).toBeDefined();
        expect(bcrypt.hash).toHaveBeenCalled();
      });

      it('should hash long password', async () => {
        const longPassword = 'a'.repeat(100);
        const result = await service.hash(longPassword);

        expect(result).toBeDefined();
        expect(bcrypt.hash).toHaveBeenCalledWith(longPassword, 10);
      });

      it('should hash password with special characters', async () => {
        const result = await service.hash('P@$$w0rd!#$%^&*()');

        expect(result).toBeDefined();
      });

      it('should hash password with spaces', async () => {
        const result = await service.hash('pass word 123');

        expect(result).toBeDefined();
      });

      it('should hash password with unicode characters', async () => {
        const result = await service.hash('pässwörd123');

        expect(result).toBeDefined();
      });
    });

    describe('Hashing Failures', () => {
      it('should throw error when bcrypt fails', async () => {
        jest
          .spyOn(bcrypt, 'hash')
          .mockRejectedValue(new Error('Bcrypt error') as never);

        await expect(service.hash(mockPlainPassword)).rejects.toThrow(
          'Password hashing failed',
        );
      });

      it('should handle bcrypt timeout', async () => {
        jest
          .spyOn(bcrypt, 'hash')
          .mockRejectedValue(new Error('Timeout') as never);

        await expect(service.hash(mockPlainPassword)).rejects.toThrow();
      });

      it('should handle bcrypt out of memory', async () => {
        jest
          .spyOn(bcrypt, 'hash')
          .mockRejectedValue(new Error('Out of memory') as never);

        await expect(service.hash(mockPlainPassword)).rejects.toThrow();
      });
    });

    describe('Edge Cases', () => {
      beforeEach(() => {
        jest
          .spyOn(bcrypt, 'hash')
          .mockResolvedValue(mockHashedPassword as never);
      });

      it('should handle empty string', async () => {
        const result = await service.hash('');

        expect(result).toBeDefined();
        expect(bcrypt.hash).toHaveBeenCalledWith('', 10);
      });

      it('should handle very short password', async () => {
        const result = await service.hash('a');

        expect(result).toBeDefined();
      });

      it('should handle password with only numbers', async () => {
        const result = await service.hash('12345678');

        expect(result).toBeDefined();
      });

      it('should handle password with only special chars', async () => {
        const result = await service.hash('!@#$%^&*');

        expect(result).toBeDefined();
      });
    });
  });

  // ======================
  // compare METHOD TESTS
  // ======================
  describe('compare', () => {
    describe('Successful Comparison', () => {
      it('should return true for matching passwords', async () => {
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

        const result = await service.compare(
          mockPlainPassword,
          mockHashedPassword,
        );

        expect(result).toBe(true);
      });

      it('should return false for non-matching passwords', async () => {
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        const result = await service.compare(
          'wrongpassword',
          mockHashedPassword,
        );

        expect(result).toBe(false);
      });

      it('should call bcrypt.compare with correct arguments', async () => {
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

        await service.compare(mockPlainPassword, mockHashedPassword);

        expect(bcrypt.compare).toHaveBeenCalledWith(
          mockPlainPassword,
          mockHashedPassword,
        );
      });

      it('should handle correct password', async () => {
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

        const result = await service.compare('correct', 'hashedcorrect');

        expect(result).toBe(true);
      });

      it('should handle incorrect password', async () => {
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        const result = await service.compare('incorrect', 'hashedcorrect');

        expect(result).toBe(false);
      });
    });

    describe('Comparison Failures', () => {
      it('should return false when bcrypt compare fails', async () => {
        jest
          .spyOn(bcrypt, 'compare')
          .mockImplementation(
            (): Promise<boolean> => Promise.reject(new Error('Error')),
          );

        const result = await service.compare(
          mockPlainPassword,
          mockHashedPassword,
        );

        expect(result).toBe(false);
      });

      it('should handle invalid hash format', async () => {
        jest
          .spyOn(bcrypt, 'compare')
          .mockImplementation(
            (): Promise<boolean> => Promise.reject(new Error('Error')),
          );

        const result = await service.compare(mockPlainPassword, 'invalid-hash');

        expect(result).toBe(false);
      });

      it('should handle bcrypt errors gracefully', async () => {
        jest
          .spyOn(bcrypt, 'compare')
          .mockImplementation(
            (): Promise<boolean> => Promise.reject(new Error('Error')),
          );

        const result = await service.compare(
          mockPlainPassword,
          mockHashedPassword,
        );

        expect(result).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty plain password', async () => {
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        const result = await service.compare('', mockHashedPassword);

        expect(result).toBe(false);
      });

      it('should handle empty hashed password', async () => {
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        const result = await service.compare(mockPlainPassword, '');

        expect(result).toBe(false);
      });

      it('should handle both empty strings', async () => {
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        const result = await service.compare('', '');

        expect(result).toBe(false);
      });

      it('should handle special characters in password', async () => {
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

        const result = await service.compare('P@$$!', mockHashedPassword);

        expect(result).toBe(true);
      });
    });
  });

  // ======================
  // dummyCompare METHOD TESTS
  // ======================
  describe('dummyCompare', () => {
    it('should perform dummy comparison', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.dummyCompare(mockPlainPassword);

      expect(result).toBe(false);
    });

    it('should call compare with dummy hash', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await service.dummyCompare(mockPlainPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockPlainPassword,
        expect.any(String),
      );
    });

    it('should always return false', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.dummyCompare('anypassword');

      expect(result).toBe(false);
    });

    it('should use predefined dummy hash', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await service.dummyCompare(mockPlainPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockPlainPassword,
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      );
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(
          (): Promise<boolean> => Promise.reject(new Error('Error')),
        );

      const result = await service.dummyCompare(mockPlainPassword);

      expect(result).toBe(false);
    });
  });

  // ======================
  // isStrongPassword METHOD TESTS
  // ======================
  describe('isStrongPassword', () => {
    describe('Strong Passwords', () => {
      it('should accept strong password', () => {
        const result = service.isStrongPassword('Password123!');

        expect(result.strong).toBe(true);
        expect(result.reasons).toHaveLength(0);
      });

      it('should accept password with all requirements', () => {
        const result = service.isStrongPassword('Abc123!@#');

        expect(result.strong).toBe(true);
        expect(result.reasons).toEqual([]);
      });

      it('should accept long strong password', () => {
        const result = service.isStrongPassword('VeryStrongP@ssw0rd2023!');

        expect(result.strong).toBe(true);
      });

      it('should accept password with multiple special chars', () => {
        const result = service.isStrongPassword('P@ssw0rd!#$');

        expect(result.strong).toBe(true);
      });
    });

    describe('Weak Passwords', () => {
      it('should reject password shorter than 8 characters', () => {
        const result = service.isStrongPassword('Pass1!');

        expect(result.strong).toBe(false);
        expect(result.reasons).toContain('Password harus minimal 8 karakter');
      });

      it('should reject password without lowercase', () => {
        const result = service.isStrongPassword('PASSWORD123!');

        expect(result.strong).toBe(false);
        expect(result.reasons).toContain(
          'Password harus mengandung huruf kecil',
        );
      });

      it('should reject password without uppercase', () => {
        const result = service.isStrongPassword('password123!');

        expect(result.strong).toBe(false);
        expect(result.reasons).toContain(
          'Password harus mengandung huruf besar',
        );
      });

      it('should reject password without numbers', () => {
        const result = service.isStrongPassword('Password!');

        expect(result.strong).toBe(false);
        expect(result.reasons).toContain('Password harus mengandung angka');
      });

      it('should reject password without special characters', () => {
        const result = service.isStrongPassword('Password123');

        expect(result.strong).toBe(false);
        expect(result.reasons).toContain(
          'Password harus mengandung karakter spesial',
        );
      });

      it('should list all missing requirements', () => {
        const result = service.isStrongPassword('pass');

        expect(result.strong).toBe(false);
        expect(result.reasons.length).toBeGreaterThan(1);
      });

      it('should reject password with only lowercase', () => {
        const result = service.isStrongPassword('password');

        expect(result.strong).toBe(false);
        expect(result.reasons.length).toBeGreaterThan(0);
      });

      it('should reject password with only uppercase', () => {
        const result = service.isStrongPassword('PASSWORD');

        expect(result.strong).toBe(false);
        expect(result.reasons.length).toBeGreaterThan(0);
      });

      it('should reject password with only numbers', () => {
        const result = service.isStrongPassword('12345678');

        expect(result.strong).toBe(false);
        expect(result.reasons.length).toBeGreaterThan(0);
      });

      it('should reject password with only special characters', () => {
        const result = service.isStrongPassword('!@#$%^&*');

        expect(result.strong).toBe(false);
        expect(result.reasons.length).toBeGreaterThan(0);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty password', () => {
        const result = service.isStrongPassword('');

        expect(result.strong).toBe(false);
        expect(result.reasons.length).toBeGreaterThan(0);
      });

      it('should handle password with spaces', () => {
        const result = service.isStrongPassword('Pass word 123!');

        expect(result.strong).toBe(true);
      });

      it('should handle exactly 8 characters', () => {
        const result = service.isStrongPassword('Pass123!');

        expect(result.strong).toBe(true);
      });

      it('should handle password with unicode', () => {
        const result = service.isStrongPassword('Pässw0rd!');

        expect(result.strong).toBe(true);
      });
    });
  });

  // ======================
  // INTEGRATION TESTS
  // ======================
  describe('Integration Scenarios', () => {
    it('should hash and compare password successfully', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(mockHashedPassword as never);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const hashed = await service.hash(mockPlainPassword);
      const isMatch = await service.compare(mockPlainPassword, hashed);

      expect(isMatch).toBe(true);
    });

    it('should validate password strength before hashing', async () => {
      const validation = service.isStrongPassword(mockPlainPassword);

      if (validation.strong) {
        jest
          .spyOn(bcrypt, 'hash')
          .mockResolvedValue(mockHashedPassword as never);
        const hashed = await service.hash(mockPlainPassword);
        expect(hashed).toBeDefined();
      }
    });

    it('should use dummy compare for timing attack prevention', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.dummyCompare('nonexistentuser');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalled();
    });
  });
});
