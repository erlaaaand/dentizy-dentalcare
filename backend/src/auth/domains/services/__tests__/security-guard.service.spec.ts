// backend/src/auth/domains/services/__tests__/security-guard.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SecurityGuardService } from '../security-guard.service';

// ======================
// TEST SUITE
// ======================
describe('SecurityGuardService', () => {
  let service: SecurityGuardService;

  // ======================
  // SETUP AND TEARDOWN
  // ======================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityGuardService],
    }).compile();

    service = module.get<SecurityGuardService>(SecurityGuardService);
  });

  afterEach(() => {
    // Clear the in-memory store
    (service as any).failedAttempts.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ======================
  // isAccountLocked METHOD TESTS
  // ======================
  describe('isAccountLocked', () => {
    describe('Account Not Locked', () => {
      it('should return false for new identifier', () => {
        const result = service.isAccountLocked('newuser');

        expect(result).toBe(false);
      });

      it('should return false when failed attempts below threshold', () => {
        service.recordFailedAttempt('testuser');
        service.recordFailedAttempt('testuser');

        const result = service.isAccountLocked('testuser');

        expect(result).toBe(false);
      });

      it('should return false when lockout period expired', () => {
        // Simulate expired lockout
        const attempt = { count: 5, lockedUntil: Date.now() - 1000 };
        (service as any).failedAttempts.set('testuser', attempt);

        const result = service.isAccountLocked('testuser');

        expect(result).toBe(false);
      });

      it('should clear data when lockout period expired', () => {
        const attempt = { count: 5, lockedUntil: Date.now() - 1000 };
        (service as any).failedAttempts.set('testuser', attempt);

        service.isAccountLocked('testuser');

        const stored = (service as any).failedAttempts.get('testuser');
        expect(stored).toBeUndefined();
      });
    });

    describe('Account Locked', () => {
      it('should return true when max failed attempts reached', () => {
        for (let i = 0; i < 5; i++) {
          service.recordFailedAttempt('testuser');
        }

        const result = service.isAccountLocked('testuser');

        expect(result).toBe(true);
      });

      it('should return true during lockout period', () => {
        const attempt = { count: 5, lockedUntil: Date.now() + 900000 };
        (service as any).failedAttempts.set('testuser', attempt);

        const result = service.isAccountLocked('testuser');

        expect(result).toBe(true);
      });

      it('should remain locked for entire duration', () => {
        for (let i = 0; i < 5; i++) {
          service.recordFailedAttempt('testuser');
        }

        expect(service.isAccountLocked('testuser')).toBe(true);
        expect(service.isAccountLocked('testuser')).toBe(true);
      });
    });

    describe('Multiple Identifiers', () => {
      it('should track different identifiers separately', () => {
        for (let i = 0; i < 5; i++) {
          service.recordFailedAttempt('user1');
        }

        expect(service.isAccountLocked('user1')).toBe(true);
        expect(service.isAccountLocked('user2')).toBe(false);
      });

      it('should not affect other users when one is locked', () => {
        for (let i = 0; i < 5; i++) {
          service.recordFailedAttempt('user1');
        }
        service.recordFailedAttempt('user2');

        expect(service.isAccountLocked('user1')).toBe(true);
        expect(service.isAccountLocked('user2')).toBe(false);
      });
    });
  });

  // ======================
  // recordFailedAttempt METHOD TESTS
  // ======================
  describe('recordFailedAttempt', () => {
    describe('Recording Attempts', () => {
      it('should record first failed attempt', () => {
        service.recordFailedAttempt('testuser');

        const attempt = (service as any).failedAttempts.get('testuser');
        expect(attempt.count).toBe(1);
      });

      it('should increment count on subsequent attempts', () => {
        service.recordFailedAttempt('testuser');
        service.recordFailedAttempt('testuser');
        service.recordFailedAttempt('testuser');

        const attempt = (service as any).failedAttempts.get('testuser');
        expect(attempt.count).toBe(3);
      });

      it('should not set lockedUntil before threshold', () => {
        service.recordFailedAttempt('testuser');
        service.recordFailedAttempt('testuser');

        const attempt = (service as any).failedAttempts.get('testuser');
        expect(attempt.lockedUntil).toBeUndefined();
      });

      it('should set lockedUntil when threshold reached', () => {
        for (let i = 0; i < 5; i++) {
          service.recordFailedAttempt('testuser');
        }

        const attempt = (service as any).failedAttempts.get('testuser');
        expect(attempt.lockedUntil).toBeDefined();
        expect(attempt.lockedUntil).toBeGreaterThan(Date.now());
      });

      it('should lock account for 15 minutes', () => {
        for (let i = 0; i < 5; i++) {
          service.recordFailedAttempt('testuser');
        }

        const attempt = (service as any).failedAttempts.get('testuser');
        const lockoutDuration = attempt.lockedUntil - Date.now();

        // Allow small margin for test execution time
        expect(lockoutDuration).toBeGreaterThan(14 * 60 * 1000);
        expect(lockoutDuration).toBeLessThan(16 * 60 * 1000);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty identifier', () => {
        expect(() => service.recordFailedAttempt('')).not.toThrow();
      });

      it('should handle very long identifier', () => {
        const longIdentifier = 'a'.repeat(1000);
        expect(() => service.recordFailedAttempt(longIdentifier)).not.toThrow();
      });

      it('should handle special characters in identifier', () => {
        expect(() => service.recordFailedAttempt('user@#$%')).not.toThrow();
      });
    });
  });

  // ======================
  // clearFailedAttempts METHOD TESTS
  // ======================
  describe('clearFailedAttempts', () => {
    it('should clear failed attempts', () => {
      service.recordFailedAttempt('testuser');
      service.recordFailedAttempt('testuser');

      service.clearFailedAttempts('testuser');

      const attempt = (service as any).failedAttempts.get('testuser');
      expect(attempt).toBeUndefined();
    });

    it('should unlock locked account', () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('testuser');
      }

      service.clearFailedAttempts('testuser');

      expect(service.isAccountLocked('testuser')).toBe(false);
    });

    it('should not affect other identifiers', () => {
      service.recordFailedAttempt('user1');
      service.recordFailedAttempt('user2');

      service.clearFailedAttempts('user1');

      const attempt1 = (service as any).failedAttempts.get('user1');
      const attempt2 = (service as any).failedAttempts.get('user2');

      expect(attempt1).toBeUndefined();
      expect(attempt2).toBeDefined();
    });

    it('should handle clearing non-existent identifier', () => {
      expect(() => service.clearFailedAttempts('nonexistent')).not.toThrow();
    });

    it('should allow login after clearing', () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('testuser');
      }

      service.clearFailedAttempts('testuser');
      service.recordFailedAttempt('testuser');

      const attempt = (service as any).failedAttempts.get('testuser');
      expect(attempt.count).toBe(1);
      expect(service.isAccountLocked('testuser')).toBe(false);
    });
  });

  // ======================
  // getRemainingLockoutTime METHOD TESTS
  // ======================
  describe('getRemainingLockoutTime', () => {
    it('should return 0 for non-locked account', () => {
      const result = service.getRemainingLockoutTime('testuser');

      expect(result).toBe(0);
    });

    it('should return remaining time for locked account', () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('testuser');
      }

      const result = service.getRemainingLockoutTime('testuser');

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(900); // 15 minutes in seconds
    });

    it('should return time in seconds', () => {
      const futureTime = Date.now() + 60000; // 60 seconds
      const attempt = { count: 5, lockedUntil: futureTime };
      (service as any).failedAttempts.set('testuser', attempt);

      const result = service.getRemainingLockoutTime('testuser');

      expect(result).toBeGreaterThan(55);
      expect(result).toBeLessThanOrEqual(60);
    });

    it('should return 0 when no lockedUntil time', () => {
      const attempt = { count: 3 };
      (service as any).failedAttempts.set('testuser', attempt);

      const result = service.getRemainingLockoutTime('testuser');

      expect(result).toBe(0);
    });

    it('should return 0 when lockout expired', () => {
      const pastTime = Date.now() - 1000;
      const attempt = { count: 5, lockedUntil: pastTime };
      (service as any).failedAttempts.set('testuser', attempt);

      const result = service.getRemainingLockoutTime('testuser');

      expect(result).toBe(0);
    });

    it('should decrease over time', async () => {
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('testuser');
      }

      const time1 = service.getRemainingLockoutTime('testuser');

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const time2 = service.getRemainingLockoutTime('testuser');

      expect(time2).toBeLessThan(time1);
    });
  });

  // ======================
  // INTEGRATION TESTS
  // ======================
  describe('Integration Scenarios', () => {
    it('should handle complete lockout cycle', () => {
      // Record attempts until locked
      for (let i = 0; i < 5; i++) {
        service.recordFailedAttempt('testuser');
        if (i < 4) {
          expect(service.isAccountLocked('testuser')).toBe(false);
        }
      }

      expect(service.isAccountLocked('testuser')).toBe(true);
      expect(service.getRemainingLockoutTime('testuser')).toBeGreaterThan(0);

      // Clear and verify
      service.clearFailedAttempts('testuser');
      expect(service.isAccountLocked('testuser')).toBe(false);
      expect(service.getRemainingLockoutTime('testuser')).toBe(0);
    });

    it('should handle multiple concurrent users', () => {
      const users = ['user1', 'user2', 'user3'];

      users.forEach((user) => {
        for (let i = 0; i < 5; i++) {
          service.recordFailedAttempt(user);
        }
      });

      users.forEach((user) => {
        expect(service.isAccountLocked(user)).toBe(true);
      });

      service.clearFailedAttempts('user2');

      expect(service.isAccountLocked('user1')).toBe(true);
      expect(service.isAccountLocked('user2')).toBe(false);
      expect(service.isAccountLocked('user3')).toBe(true);
    });

    it('should handle rapid failed attempts', () => {
      for (let i = 0; i < 10; i++) {
        service.recordFailedAttempt('testuser');
      }

      expect(service.isAccountLocked('testuser')).toBe(true);

      const attempt = (service as any).failedAttempts.get('testuser');
      expect(attempt.count).toBe(10);
    });
  });
});
