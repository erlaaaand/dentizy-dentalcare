// backend/src/auth/infrastructures/security/__tests__/timing-defense.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TimingDefenseService } from '../timing-defense.service';

// ======================
// TEST SUITE
// ======================
describe('TimingDefenseService', () => {
  let service: TimingDefenseService;

  // ======================
  // SETUP AND TEARDOWN
  // ======================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimingDefenseService],
    }).compile();

    service = module.get<TimingDefenseService>(TimingDefenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ======================
  // ensureMinimumResponseTime METHOD TESTS
  // ======================
  describe('ensureMinimumResponseTime', () => {
    describe('Timing Enforcement', () => {
      it('should add delay for fast operations', async () => {
        const startTime = Date.now();

        await service.ensureMinimumResponseTime(startTime);

        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(200);
      });

      it('should ensure minimum 200ms response time', async () => {
        const startTime = Date.now();

        await service.ensureMinimumResponseTime(startTime);

        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(200);
        expect(elapsed).toBeLessThan(300);
      });

      it('should not add delay when time already exceeded', async () => {
        const startTime = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 250));

        const beforeCall = Date.now();
        await service.ensureMinimumResponseTime(startTime);
        const afterCall = Date.now();

        const additionalDelay = afterCall - beforeCall;
        expect(additionalDelay).toBeLessThan(50);
      });

      it('should add jitter to response time', async () => {
        const startTime = Date.now();

        await service.ensureMinimumResponseTime(startTime);

        const elapsed = Date.now() - startTime;
        // Should be between MIN_RESPONSE_TIME_MS and MIN_RESPONSE_TIME_MS + MAX_JITTER_MS
        expect(elapsed).toBeGreaterThanOrEqual(200);
        expect(elapsed).toBeLessThanOrEqual(250);
      });

      it('should create different delays with jitter', async () => {
        const delays: number[] = [];

        for (let i = 0; i < 5; i++) {
          const startTime = Date.now();
          await service.ensureMinimumResponseTime(startTime);
          delays.push(Date.now() - startTime);
        }

        // Not all delays should be exactly the same due to jitter
        const uniqueDelays = new Set(delays.map((d) => Math.floor(d / 10)));
        expect(uniqueDelays.size).toBeGreaterThan(1);
      });
    });

    describe('Edge Cases', () => {
      it('should handle start time in the future', async () => {
        const futureTime = Date.now() + 1000;

        await service.ensureMinimumResponseTime(futureTime);

        // Should not throw and should handle gracefully
        expect(true).toBe(true);
      });

      it('should handle very old start time', async () => {
        const oldTime = Date.now() - 10000;

        const start = Date.now();
        await service.ensureMinimumResponseTime(oldTime);
        const elapsed = Date.now() - start;

        // Should add minimal or no delay
        expect(elapsed).toBeLessThan(10);
      });

      it('should handle start time of 0', async () => {
        const start = Date.now();
        await service.ensureMinimumResponseTime(0);
        const elapsed = Date.now() - start;

        expect(elapsed).toBeLessThan(10);
      });

      it('should handle negative start time', async () => {
        const start = Date.now();
        await service.ensureMinimumResponseTime(-1000);
        const elapsed = Date.now() - start;

        expect(elapsed).toBeLessThan(10);
      });
    });
  });

  // ======================
  // executeWithProtection METHOD TESTS
  // ======================
  describe('executeWithProtection', () => {
    describe('Successful Operations', () => {
      it('should execute operation and return result', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        const result = await service.executeWithProtection(operation);

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
      });

      it('should apply timing protection', async () => {
        const startTime = Date.now();
        const operation = jest.fn().mockResolvedValue('result');

        await service.executeWithProtection(operation);

        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(200);
      });

      it('should return operation result', async () => {
        const operation = jest.fn().mockResolvedValue({ data: 'test' });

        const result = await service.executeWithProtection(operation);

        expect(result).toEqual({ data: 'test' });
      });

      it('should handle operation returning null', async () => {
        const operation = jest.fn().mockResolvedValue(null);

        const result = await service.executeWithProtection(operation);

        expect(result).toBeNull();
      });

      it('should handle operation returning undefined', async () => {
        const operation = jest.fn().mockResolvedValue(undefined);

        const result = await service.executeWithProtection(operation);

        expect(result).toBeUndefined();
      });

      it('should handle operation returning boolean', async () => {
        const operation = jest.fn().mockResolvedValue(true);

        const result = await service.executeWithProtection(operation);

        expect(result).toBe(true);
      });

      it('should handle operation returning number', async () => {
        const operation = jest.fn().mockResolvedValue(42);

        const result = await service.executeWithProtection(operation);

        expect(result).toBe(42);
      });
    });

    describe('Failed Operations', () => {
      it('should apply timing protection even on error', async () => {
        const startTime = Date.now();
        const operation = jest.fn().mockRejectedValue(new Error('Failed'));

        await expect(service.executeWithProtection(operation)).rejects.toThrow(
          'Failed',
        );

        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(200);
      });

      it('should throw original error', async () => {
        const operation = jest
          .fn()
          .mockRejectedValue(new Error('Custom error'));

        await expect(service.executeWithProtection(operation)).rejects.toThrow(
          'Custom error',
        );
      });

      it('should handle operation throwing synchronously', async () => {
        const operation = jest.fn().mockImplementation(() => {
          throw new Error('Sync error');
        });

        await expect(service.executeWithProtection(operation)).rejects.toThrow(
          'Sync error',
        );
      });

      it('should apply timing protection for different error types', async () => {
        const startTime = Date.now();
        const operation = jest
          .fn()
          .mockRejectedValue(new TypeError('Type error'));

        await expect(service.executeWithProtection(operation)).rejects.toThrow(
          TypeError,
        );

        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(200);
      });

      it('should maintain timing consistency on errors', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('Error'));

        const start = Date.now();
        await expect(
          service.executeWithProtection(operation),
        ).rejects.toThrow();
        const elapsed = Date.now() - start;

        expect(elapsed).toBeGreaterThanOrEqual(200);
      });
    });

    describe('Timing Consistency', () => {
      it('should make fast and slow operations take similar time', async () => {
        const fastOperation = jest.fn().mockResolvedValue('fast');
        const slowOperation = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 150));
          return 'slow';
        });

        const start1 = Date.now();
        await service.executeWithProtection(fastOperation);
        const time1 = Date.now() - start1;

        const start2 = Date.now();
        await service.executeWithProtection(slowOperation);
        const time2 = Date.now() - start2;

        // Both should take at least 200ms
        expect(time1).toBeGreaterThanOrEqual(200);
        expect(time2).toBeGreaterThanOrEqual(200);

        // Time difference should be small
        const timeDifference = Math.abs(time1 - time2);
        expect(timeDifference).toBeLessThan(100);
      });

      it('should apply consistent timing for multiple calls', async () => {
        const operation = jest.fn().mockResolvedValue('result');
        const times: number[] = [];

        for (let i = 0; i < 3; i++) {
          const start = Date.now();
          await service.executeWithProtection(operation);
          times.push(Date.now() - start);
        }

        // All should be >= 200ms
        times.forEach((time) => {
          expect(time).toBeGreaterThanOrEqual(200);
        });

        // Variance should be within jitter range
        const max = Math.max(...times);
        const min = Math.min(...times);
        expect(max - min).toBeLessThan(100);
      });

      it('should protect success and failure paths equally', async () => {
        const successOp = jest.fn().mockResolvedValue('success');
        const failureOp = jest.fn().mockRejectedValue(new Error('fail'));

        const start1 = Date.now();
        await service.executeWithProtection(successOp);
        const time1 = Date.now() - start1;

        const start2 = Date.now();
        await expect(
          service.executeWithProtection(failureOp),
        ).rejects.toThrow();
        const time2 = Date.now() - start2;

        const timeDifference = Math.abs(time1 - time2);
        expect(timeDifference).toBeLessThan(100);
      });
    });

    describe('Edge Cases', () => {
      it('should handle operation that resolves immediately', async () => {
        const operation = jest.fn().mockResolvedValue('immediate');

        const result = await service.executeWithProtection(operation);

        expect(result).toBe('immediate');
      });

      it('should handle operation with very long execution time', async () => {
        const operation = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return 'slow';
        });

        const startTime = Date.now();
        const result = await service.executeWithProtection(operation);
        const elapsed = Date.now() - startTime;

        expect(result).toBe('slow');
        expect(elapsed).toBeGreaterThanOrEqual(500);
      });

      it('should handle operation returning large objects', async () => {
        const largeObject = { data: 'x'.repeat(10000) };
        const operation = jest.fn().mockResolvedValue(largeObject);

        const result = await service.executeWithProtection(operation);

        expect(result).toEqual(largeObject);
      });

      it('should handle operation returning arrays', async () => {
        const array = [1, 2, 3, 4, 5];
        const operation = jest.fn().mockResolvedValue(array);

        const result = await service.executeWithProtection(operation);

        expect(result).toEqual(array);
      });
    });
  });

  // ======================
  // addRandomDelay METHOD TESTS
  // ======================
  describe('addRandomDelay', () => {
    describe('Delay Range', () => {
      it('should add delay within specified range', async () => {
        const start = Date.now();

        await service.addRandomDelay(100, 200);

        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(100);
        expect(elapsed).toBeLessThanOrEqual(210); // Small margin for execution
      });

      it('should handle minimum delay', async () => {
        const start = Date.now();

        await service.addRandomDelay(50, 50);

        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(50);
        expect(elapsed).toBeLessThanOrEqual(70);
      });

      it('should create variable delays', async () => {
        const delays: number[] = [];

        for (let i = 0; i < 5; i++) {
          const start = Date.now();
          await service.addRandomDelay(100, 200);
          delays.push(Date.now() - start);
        }

        // Should have some variation
        const uniqueRanges = new Set(delays.map((d) => Math.floor(d / 20)));
        expect(uniqueRanges.size).toBeGreaterThan(1);
      });

      it('should handle zero minimum delay', async () => {
        const start = Date.now();

        await service.addRandomDelay(0, 100);

        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(0);
        expect(elapsed).toBeLessThanOrEqual(110);
      });

      it('should handle equal min and max', async () => {
        const start = Date.now();

        await service.addRandomDelay(100, 100);

        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(100);
        expect(elapsed).toBeLessThan(120);
      });
    });

    describe('Edge Cases', () => {
      it('should handle very small delays', async () => {
        const start = Date.now();

        await service.addRandomDelay(1, 5);

        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(0);
        expect(elapsed).toBeLessThan(20);
      });

      it('should handle large delays', async () => {
        const start = Date.now();

        await service.addRandomDelay(500, 600);

        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(500);
        expect(elapsed).toBeLessThanOrEqual(610);
      });

      it('should handle fractional delays', async () => {
        const start = Date.now();

        await service.addRandomDelay(10.5, 20.7);

        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(10);
      });

      it('should handle negative minimum (treated as 0)', async () => {
        const start = Date.now();

        await service.addRandomDelay(-10, 100);

        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ======================
  // INTEGRATION TESTS
  // ======================
  describe('Integration Scenarios', () => {
    it('should combine all timing protections', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const start = Date.now();
      await service.executeWithProtection(operation);
      await service.addRandomDelay(50, 100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(250);
    });

    it('should protect multiple operations consistently', async () => {
      const op1 = jest.fn().mockResolvedValue('fast');
      const op2 = jest.fn().mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 100));
        return 'slow';
      });

      const start1 = Date.now();
      await service.executeWithProtection(op1);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await service.executeWithProtection(op2);
      const time2 = Date.now() - start2;

      const difference = Math.abs(time1 - time2);
      expect(difference).toBeLessThan(150);
    });

    it('should handle complex authentication flow', async () => {
      const findUser = jest.fn().mockResolvedValue({ id: 1 });
      const checkPassword = jest.fn().mockResolvedValue(true);

      const start = Date.now();
      await service.executeWithProtection(async () => {
        await findUser();
        await checkPassword();
        return 'authenticated';
      });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(200);
      expect(findUser).toHaveBeenCalled();
      expect(checkPassword).toHaveBeenCalled();
    });
  });
});
