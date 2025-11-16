// backend/src/auth/domains/validators/__tests__/timing-attack.guard.spec.ts
import { TimingAttackGuard } from '../timing-attack.guard';

// ======================
// TEST SUITE
// ======================
describe('TimingAttackGuard', () => {
  it('should be defined', () => {
    expect(TimingAttackGuard).toBeDefined();
  });

  // ======================
  // calculateDelay METHOD TESTS
  // ======================
  describe('calculateDelay', () => {
    describe('Delay Calculation', () => {
      it('should return positive delay when operation is fast', () => {
        const startTime = Date.now();
        const delay = TimingAttackGuard.calculateDelay(startTime);

        expect(delay).toBeGreaterThanOrEqual(0);
      });

      it('should return delay within expected range', () => {
        const startTime = Date.now();
        const delay = TimingAttackGuard.calculateDelay(startTime);

        // MIN_RESPONSE_TIME_MS = 200, MAX_JITTER_MS = 50
        expect(delay).toBeLessThanOrEqual(250); // 200 + 50
      });

      it('should return zero or small delay when operation is slow', async () => {
        const startTime = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 250));
        const delay = TimingAttackGuard.calculateDelay(startTime);

        expect(delay).toBeLessThan(50);
      });

      it('should return zero when elapsed time exceeds minimum', async () => {
        const startTime = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 300));
        const delay = TimingAttackGuard.calculateDelay(startTime);

        expect(delay).toBe(0);
      });

      it('should include jitter in calculation', () => {
        const startTime = Date.now();
        const delay1 = TimingAttackGuard.calculateDelay(startTime);
        const delay2 = TimingAttackGuard.calculateDelay(startTime);

        // Delays should potentially differ due to jitter
        expect(typeof delay1).toBe('number');
        expect(typeof delay2).toBe('number');
      });

      it('should always return non-negative delay', () => {
        const startTime = Date.now() - 1000; // Past time
        const delay = TimingAttackGuard.calculateDelay(startTime);

        expect(delay).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Timing Consistency', () => {
      it('should calculate delay for immediate call', () => {
        const startTime = Date.now();
        const delay = TimingAttackGuard.calculateDelay(startTime);

        expect(delay).toBeGreaterThan(0);
        expect(delay).toBeLessThanOrEqual(250);
      });

      it('should calculate delay for call after 50ms', async () => {
        const startTime = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 50));
        const delay = TimingAttackGuard.calculateDelay(startTime);

        expect(delay).toBeGreaterThan(0);
        expect(delay).toBeLessThan(250);
      });

      it('should calculate delay for call after 100ms', async () => {
        const startTime = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 100));
        const delay = TimingAttackGuard.calculateDelay(startTime);

        expect(delay).toBeGreaterThan(0);
        expect(delay).toBeLessThan(200);
      });

      it('should calculate delay for call after 200ms', async () => {
        const startTime = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 200));
        const delay = TimingAttackGuard.calculateDelay(startTime);

        expect(delay).toBeLessThanOrEqual(50);
      });
    });

    describe('Edge Cases', () => {
      it('should handle start time in the future', () => {
        const futureTime = Date.now() + 1000;
        const delay = TimingAttackGuard.calculateDelay(futureTime);

        expect(delay).toBeGreaterThanOrEqual(0);
      });

      it('should handle very old start time', () => {
        const oldTime = Date.now() - 10000;
        const delay = TimingAttackGuard.calculateDelay(oldTime);

        expect(delay).toBe(0);
      });

      it('should handle start time of 0', () => {
        const delay = TimingAttackGuard.calculateDelay(0);

        expect(delay).toBe(0);
      });

      it('should handle negative start time', () => {
        const delay = TimingAttackGuard.calculateDelay(-1000);

        expect(delay).toBe(0);
      });
    });
  });

  // ======================
  // executeWithTimingProtection METHOD TESTS
  // ======================
  describe('executeWithTimingProtection', () => {
    describe('Successful Operations', () => {
      it('should execute operation and return result', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        const result = await TimingAttackGuard.executeWithTimingProtection(
          operation,
        );

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
      });

      it('should apply timing protection to fast operations', async () => {
        const startTime = Date.now();
        const operation = jest.fn().mockResolvedValue('result');

        await TimingAttackGuard.executeWithTimingProtection(operation);

        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(200);
      });

      it('should return correct value from operation', async () => {
        const operation = jest.fn().mockResolvedValue({ data: 'test' });

        const result = await TimingAttackGuard.executeWithTimingProtection(
          operation,
        );

        expect(result).toEqual({ data: 'test' });
      });

      it('should handle operation returning null', async () => {
        const operation = jest.fn().mockResolvedValue(null);

        const result = await TimingAttackGuard.executeWithTimingProtection(
          operation,
        );

        expect(result).toBeNull();
      });

      it('should handle operation returning undefined', async () => {
        const operation = jest.fn().mockResolvedValue(undefined);

        const result = await TimingAttackGuard.executeWithTimingProtection(
          operation,
        );

        expect(result).toBeUndefined();
      });

      it('should handle operation returning number', async () => {
        const operation = jest.fn().mockResolvedValue(42);

        const result = await TimingAttackGuard.executeWithTimingProtection(
          operation,
        );

        expect(result).toBe(42);
      });

      it('should handle operation returning boolean', async () => {
        const operation = jest.fn().mockResolvedValue(true);

        const result = await TimingAttackGuard.executeWithTimingProtection(
          operation,
        );

        expect(result).toBe(true);
      });
    });

    describe('Failed Operations', () => {
      it('should apply timing protection even on error', async () => {
        const startTime = Date.now();
        const operation = jest.fn().mockRejectedValue(new Error('Failed'));

        await expect(
          TimingAttackGuard.executeWithTimingProtection(operation),
        ).rejects.toThrow('Failed');

        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(200);
      });

      it('should throw original error', async () => {
        const operation = jest
          .fn()
          .mockRejectedValue(new Error('Custom error'));

        await expect(
          TimingAttackGuard.executeWithTimingProtection(operation),
        ).rejects.toThrow('Custom error');
      });

      it('should handle operation throwing synchronously', async () => {
        const operation = jest.fn().mockImplementation(() => {
          throw new Error('Sync error');
        });

        await expect(
          TimingAttackGuard.executeWithTimingProtection(operation),
        ).rejects.toThrow('Sync error');
      });

      it('should apply timing protection for different error types', async () => {
        const startTime = Date.now();
        const operation = jest.fn().mockRejectedValue(new TypeError('Type error'));

        await expect(
          TimingAttackGuard.executeWithTimingProtection(operation),
        ).rejects.toThrow(TypeError);

        const elapsed = Date.now() - startTime;
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
        await TimingAttackGuard.executeWithTimingProtection(fastOperation);
        const time1 = Date.now() - start1;

        const start2 = Date.now();
        await TimingAttackGuard.executeWithTimingProtection(slowOperation);
        const time2 = Date.now() - start2;

        // Both should take at least 200ms
        expect(time1).toBeGreaterThanOrEqual(200);
        expect(time2).toBeGreaterThanOrEqual(200);

        // Time difference should be relatively small (within jitter range)
        const timeDifference = Math.abs(time1 - time2);
        expect(timeDifference).toBeLessThan(100);
      });

      it('should apply consistent timing for multiple calls', async () => {
        const operation = jest.fn().mockResolvedValue('result');
        const times: number[] = [];

        for (let i = 0; i < 3; i++) {
          const start = Date.now();
          await TimingAttackGuard.executeWithTimingProtection(operation);
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
    });

    describe('Edge Cases', () => {
      it('should handle operation that resolves immediately', async () => {
        const operation = jest.fn().mockResolvedValue('immediate');

        const result = await TimingAttackGuard.executeWithTimingProtection(
          operation,
        );

        expect(result).toBe('immediate');
      });

      it('should handle operation with very long execution time', async () => {
        const operation = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return 'slow';
        });

        const startTime = Date.now();
        const result = await TimingAttackGuard.executeWithTimingProtection(
          operation,
        );
        const elapsed = Date.now() - startTime;

        expect(result).toBe('slow');
        expect(elapsed).toBeGreaterThanOrEqual(500);
      });

      it('should handle operation returning large objects', async () => {
        const largeObject = { data: 'x'.repeat(10000) };
        const operation = jest.fn().mockResolvedValue(largeObject);

        const result = await TimingAttackGuard.executeWithTimingProtection(
          operation,
        );

        expect(result).toEqual(largeObject);
      });

      it('should handle operation returning arrays', async () => {
        const array = [1, 2, 3, 4, 5];
        const operation = jest.fn().mockResolvedValue(array);

        const result = await TimingAttackGuard.executeWithTimingProtection(
          operation,
        );

        expect(result).toEqual(array);
      });
    });
  });

  // ======================
  // INTEGRATION TESTS
  // ======================
  describe('Integration Scenarios', () => {
    it('should protect against timing attacks in authentication', async () => {
      const validCredentials = jest.fn().mockResolvedValue(true);
      const invalidCredentials = jest.fn().mockResolvedValue(false);

      const start1 = Date.now();
      await TimingAttackGuard.executeWithTimingProtection(validCredentials);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await TimingAttackGuard.executeWithTimingProtection(invalidCredentials);
      const time2 = Date.now() - start2;

      // Both should take similar time
      const timeDifference = Math.abs(time1 - time2);
      expect(timeDifference).toBeLessThan(100);
    });

    it('should protect both success and failure paths', async () => {
      const successPath = jest.fn().mockResolvedValue('success');
      const failurePath = jest.fn().mockRejectedValue(new Error('failed'));

      const start1 = Date.now();
      await TimingAttackGuard.executeWithTimingProtection(successPath);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await expect(
        TimingAttackGuard.executeWithTimingProtection(failurePath),
      ).rejects.toThrow();
      const time2 = Date.now() - start2;

      // Both paths should take similar time
      const timeDifference = Math.abs(time1 - time2);
      expect(timeDifference).toBeLessThan(100);
    });

    it('should handle multiple concurrent operations', async () => {
      const operations = Array(5)
        .fill(null)
        .map(() => jest.fn().mockResolvedValue('result'));

      const promises = operations.map((op) =>
        TimingAttackGuard.executeWithTimingProtection(op),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toBe('result');
      });
    });
  });
});