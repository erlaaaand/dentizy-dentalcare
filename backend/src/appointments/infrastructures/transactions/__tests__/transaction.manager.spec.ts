import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { TransactionManager } from '../transaction.manager';

describe('TransactionManager', () => {
  let transactionManager: TransactionManager;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined), // default sukses
      release: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueryRunner>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionManager],
    }).compile();

    transactionManager = module.get<TransactionManager>(TransactionManager);

    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeInTransaction', () => {
    it('should connect, start, commit, and release transaction', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      await transactionManager.executeInTransaction(
        queryRunner,
        operation,
        'test-op',
      );

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(operation).toHaveBeenCalledWith(queryRunner);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should return operation result', async () => {
      const operation = jest.fn().mockResolvedValue('test-result');

      const result = await transactionManager.executeInTransaction(
        queryRunner,
        operation,
        'test-op',
      );

      expect(result).toBe('test-result');
    });

    it('should log transaction lifecycle', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');

      await transactionManager.executeInTransaction(
        queryRunner,
        operation,
        'test-op',
      );

      expect(debugSpy).toHaveBeenCalledWith('🔄 Starting transaction: test-op');
      expect(debugSpy).toHaveBeenCalledWith(
        '✅ Transaction committed: test-op',
      );
      expect(debugSpy).toHaveBeenCalledWith('🔌 Connection released: test-op');
    });

    it('should rollback and release on error', async () => {
      const error = new Error('Operation failed');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(
        transactionManager.executeInTransaction(
          queryRunner,
          operation,
          'test-op',
        ),
      ).rejects.toThrow('Operation failed');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });

    it('should log error on rollback', async () => {
      const error = new Error('Operation failed');
      const operation = jest.fn().mockRejectedValue(error);
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      try {
        await transactionManager.executeInTransaction(
          queryRunner,
          operation,
          'test-op',
        );
      } catch (e) {
        // Expected error
      }

      expect(errorSpy).toHaveBeenCalledWith(
        '❌ Transaction rolled back: test-op',
        error.stack,
      );
    });

    it('should release connection even if commit fails', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      queryRunner.commitTransaction.mockRejectedValue(
        new Error('Commit failed'),
      );

      try {
        await transactionManager.executeInTransaction(
          queryRunner,
          operation,
          'test-op',
        );
      } catch (e) {
        // Expected error
      }

      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('executeMultiple', () => {
    it('should execute multiple operations in single transaction', async () => {
      const op1 = jest.fn().mockResolvedValue('result1');
      const op2 = jest.fn().mockResolvedValue('result2');
      const op3 = jest.fn().mockResolvedValue('result3');

      const results = await transactionManager.executeMultiple(
        queryRunner,
        [op1, op2, op3],
        'multi-op',
      );

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(op1).toHaveBeenCalledWith(queryRunner);
      expect(op2).toHaveBeenCalledWith(queryRunner);
      expect(op3).toHaveBeenCalledWith(queryRunner);
      expect(results).toEqual(['result1', 'result2', 'result3']);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback all if one operation fails', async () => {
      const op1 = jest.fn().mockResolvedValue('result1');
      const op2 = jest.fn().mockRejectedValue(new Error('Op2 failed'));
      const op3 = jest.fn().mockResolvedValue('result3');

      await expect(
        transactionManager.executeMultiple(
          queryRunner,
          [op1, op2, op3],
          'multi-op',
        ),
      ).rejects.toThrow('Op2 failed');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(op3).not.toHaveBeenCalled(); // Should not execute after failure
    });

    it('should log multiple operations lifecycle', async () => {
      const operations = [
        jest.fn().mockResolvedValue('result1'),
        jest.fn().mockResolvedValue('result2'),
      ];
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');

      await transactionManager.executeMultiple(
        queryRunner,
        operations,
        'multi-op',
      );

      expect(debugSpy).toHaveBeenCalledWith(
        '🔄 Starting multiple operations: multi-op',
      );
      expect(debugSpy).toHaveBeenCalledWith(
        '✅ All operations committed: multi-op',
      );
    });

    it('should release connection after multiple operations', async () => {
      const operations = [jest.fn().mockResolvedValue('result')];

      await transactionManager.executeMultiple(
        queryRunner,
        operations,
        'multi-op',
      );

      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('executeWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await transactionManager.executeWithRetry(
        queryRunner,
        operation,
        3,
        'retry-op',
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on deadlock error', async () => {
      const deadlockError = new Error('Deadlock detected');
      (deadlockError as any).code = 'ER_LOCK_DEADLOCK';

      const operation = jest
        .fn()
        .mockRejectedValueOnce(deadlockError)
        .mockResolvedValueOnce('success');

      const result = await transactionManager.executeWithRetry(
        queryRunner,
        operation,
        3,
        'retry-op',
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should log retry attempts', async () => {
      const deadlockError = new Error('Deadlock detected');
      (deadlockError as any).code = 'ER_LOCK_DEADLOCK';

      const operation = jest
        .fn()
        .mockRejectedValueOnce(deadlockError)
        .mockResolvedValueOnce('success');

      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await transactionManager.executeWithRetry(
        queryRunner,
        operation,
        3,
        'retry-op',
      );

      expect(warnSpy).toHaveBeenCalledWith(
        '⚠️ Deadlock detected, retrying... (1/3)',
      );
    });

    it('should fail after max retries', async () => {
      const deadlockError = new Error('Deadlock detected');
      (deadlockError as any).code = 'ER_LOCK_DEADLOCK';

      const operation = jest.fn().mockRejectedValue(deadlockError);

      await expect(
        transactionManager.executeWithRetry(
          queryRunner,
          operation,
          3,
          'retry-op',
        ),
      ).rejects.toThrow('Deadlock detected');

      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-deadlock errors', async () => {
      const normalError = new Error('Normal error');
      const operation = jest.fn().mockRejectedValue(normalError);

      await expect(
        transactionManager.executeWithRetry(
          queryRunner,
          operation,
          3,
          'retry-op',
        ),
      ).rejects.toThrow('Normal error');

      expect(operation).toHaveBeenCalledTimes(1); // No retry
    });

    it('should use exponential backoff between retries', async () => {
      const deadlockError = new Error('deadlock');
      const operation = jest
        .fn()
        .mockRejectedValueOnce(deadlockError)
        .mockRejectedValueOnce(deadlockError)
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      await transactionManager.executeWithRetry(
        queryRunner,
        operation,
        3,
        'retry-op',
      );
      const duration = Date.now() - startTime;

      // Should wait ~200ms (2^1 * 100) + ~400ms (2^2 * 100) = ~600ms minimum
      expect(duration).toBeGreaterThan(550);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should handle message-based deadlock detection', async () => {
      const deadlockError = new Error('Transaction deadlock found');
      const operation = jest
        .fn()
        .mockRejectedValueOnce(deadlockError)
        .mockResolvedValueOnce('success');

      const result = await transactionManager.executeWithRetry(
        queryRunner,
        operation,
        3,
        'retry-op',
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle undefined error stack', async () => {
      const errorWithoutStack = new Error('No stack');
      delete (errorWithoutStack as any).stack;
      const operation = jest.fn().mockRejectedValue(errorWithoutStack);
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      try {
        await transactionManager.executeInTransaction(
          queryRunner,
          operation,
          'test-op',
        );
      } catch (e) {
        // Expected
      }

      expect(errorSpy).toHaveBeenCalledWith(
        '❌ Transaction rolled back: test-op',
        undefined,
      );
    });

    it('should handle connection failure', async () => {
      queryRunner.connect.mockRejectedValue(new Error('Connection failed'));
      const operation = jest.fn();

      await expect(
        transactionManager.executeInTransaction(
          queryRunner,
          operation,
          'test-op',
        ),
      ).rejects.toThrow('Connection failed');

      expect(operation).not.toHaveBeenCalled();
      expect(queryRunner.startTransaction).not.toHaveBeenCalled();
    });

    it('should handle rollback failure', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Op failed'));
      queryRunner.rollbackTransaction.mockRejectedValue(
        new Error('Rollback failed'),
      ); // simulate rollback failure

      await expect(
        transactionManager.executeInTransaction(
          queryRunner,
          operation,
          'test-op',
        ),
      ).rejects.toThrow('Op failed'); // original error tetap dilempar

      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('performance considerations', () => {
    it('should execute operations sequentially in executeMultiple', async () => {
      const executionOrder: number[] = [];
      const op1 = jest.fn(async () => {
        executionOrder.push(1);
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      const op2 = jest.fn(async () => {
        executionOrder.push(2);
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      const op3 = jest.fn(async () => {
        executionOrder.push(3);
      });

      await transactionManager.executeMultiple(
        queryRunner,
        [op1, op2, op3],
        'sequential-test',
      );

      expect(executionOrder).toEqual([1, 2, 3]);
    });
  });
});
