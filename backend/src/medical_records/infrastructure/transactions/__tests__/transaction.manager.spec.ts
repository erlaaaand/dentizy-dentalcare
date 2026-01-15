import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { DataSource, QueryRunner, EntityManager } from 'typeorm';
import { TransactionManager } from '../transaction.manager';

describe('TransactionManager', () => {
  let manager: TransactionManager;
  let dataSource: DataSource;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let mockEntityManager: jest.Mocked<EntityManager>;

  // ==================== MOCK DATA ====================
  const mockOperation = jest.fn().mockResolvedValue('success');
  const mockFailingOperation = jest
    .fn()
    .mockRejectedValue(new Error('Operation failed'));

  // ==================== SETUP AND TEARDOWN ====================
  beforeEach(async () => {
    mockEntityManager = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    } as any;

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue(undefined),
      manager: mockEntityManager,
      isTransactionActive: false,
    } as any;

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      isInitialized: true,
      query: jest.fn().mockResolvedValue([{ '1': 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionManager,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    manager = module.get<TransactionManager>(TransactionManager);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== RUN IN TRANSACTION TESTS ====================
  describe('runInTransaction', () => {
    it('should execute operation within transaction', async () => {
      const result = await manager.runInTransaction(mockOperation);

      expect(result).toBe('success');
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should pass entity manager to operation', async () => {
      await manager.runInTransaction(mockOperation);

      expect(mockOperation).toHaveBeenCalledWith(mockEntityManager);
    });

    it('should rollback on operation failure', async () => {
      await expect(
        manager.runInTransaction(mockFailingOperation),
      ).rejects.toThrow('Operation failed');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    });

    it('should release connection after success', async () => {
      await manager.runInTransaction(mockOperation);

      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should release connection after failure', async () => {
      await expect(
        manager.runInTransaction(mockFailingOperation),
      ).rejects.toThrow();

      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should log transaction start', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await manager.runInTransaction(mockOperation);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Transaction'),
      );
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('started'));
    });

    it('should log transaction commit', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await manager.runInTransaction(mockOperation);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('committed successfully'),
      );
    });

    it('should log transaction rollback', async () => {
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      await expect(
        manager.runInTransaction(mockFailingOperation),
      ).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('rolled back'),
        expect.any(String),
      );
    });

    it('should log with context', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await manager.runInTransaction(mockOperation, 'test-context');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('test-context'),
      );
    });
  });

  // ==================== CREATE QUERY RUNNER TESTS ====================
  describe('createQueryRunner', () => {
    it('should create and connect query runner', async () => {
      const queryRunner = await manager.createQueryRunner();

      expect(queryRunner).toBe(mockQueryRunner);
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
    });
  });

  // ==================== RUN BATCH TESTS ====================
  describe('runBatch', () => {
    it('should execute multiple operations in sequence', async () => {
      const op1 = jest.fn().mockResolvedValue('result1');
      const op2 = jest.fn().mockResolvedValue('result2');
      const op3 = jest.fn().mockResolvedValue('result3');

      const results = await manager.runBatch([op1, op2, op3]);

      expect(results).toEqual(['result1', 'result2', 'result3']);
      expect(op1).toHaveBeenCalled();
      expect(op2).toHaveBeenCalled();
      expect(op3).toHaveBeenCalled();
    });

    it('should rollback all if one fails', async () => {
      const op1 = jest.fn().mockResolvedValue('result1');
      const op2 = jest.fn().mockRejectedValue(new Error('Failed'));
      const op3 = jest.fn().mockResolvedValue('result3');

      await expect(manager.runBatch([op1, op2, op3])).rejects.toThrow('Failed');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(op3).not.toHaveBeenCalled();
    });

    it('should log batch progress', async () => {
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation();
      const operations = [
        jest.fn().mockResolvedValue('r1'),
        jest.fn().mockResolvedValue('r2'),
      ];

      await manager.runBatch(operations);

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('batch operation'),
      );
    });

    it('should pass context to transaction', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const operations = [jest.fn().mockResolvedValue('r1')];

      await manager.runBatch(operations, 'batch-context');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('batch-context'),
      );
    });
  });

  // ==================== RUN WITH SAVEPOINT TESTS ====================
  describe('runWithSavepoint', () => {
    it('should create savepoint before operation', async () => {
      await manager.runWithSavepoint(mockQueryRunner, mockOperation, 'test_sp');

      expect(mockQueryRunner.query).toHaveBeenCalledWith('SAVEPOINT test_sp');
    });

    it('should rollback to savepoint on failure', async () => {
      await expect(
        manager.runWithSavepoint(
          mockQueryRunner,
          mockFailingOperation,
          'test_sp',
        ),
      ).rejects.toThrow('Operation failed');

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'ROLLBACK TO SAVEPOINT test_sp',
      );
    });

    it('should log savepoint creation', async () => {
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation();

      await manager.runWithSavepoint(mockQueryRunner, mockOperation, 'test_sp');

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Creating savepoint'),
      );
    });

    it('should log savepoint completion', async () => {
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation();

      await manager.runWithSavepoint(mockQueryRunner, mockOperation, 'test_sp');

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('completed'),
      );
    });

    it('should generate savepoint name if not provided', async () => {
      await manager.runWithSavepoint(mockQueryRunner, mockOperation);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringMatching(/SAVEPOINT sp_\d+/),
      );
    });
  });

  // ==================== IS TRANSACTION ACTIVE TESTS ====================
  describe('isTransactionActive', () => {
    it('should return true when transaction is active', () => {
      const mockQueryRunner: any = { isTransactionActive: true };

      const result = manager.isTransactionActive(mockQueryRunner);

      expect(result).toBe(true);
    });

    it('should return false when transaction is not active', () => {
      const mockQueryRunner: any = { isTransactionActive: false };

      const result = manager.isTransactionActive(mockQueryRunner);

      expect(result).toBe(false);
    });
  });

  // ==================== GET TRANSACTION DEPTH TESTS ====================
  describe('getTransactionDepth', () => {
    it('should return 1 when transaction is active', () => {
      const mockQueryRunner: any = { isTransactionActive: true };
      const depth = manager.getTransactionDepth(mockQueryRunner);

      expect(depth).toBe(1);
    });

    it('should return 0 when no transaction', () => {
      const mockQueryRunner: any = { isTransactionActive: false };

      const depth = manager.getTransactionDepth(mockQueryRunner);

      expect(depth).toBe(0);
    });
  });

  // ==================== RUN WITH RETRY TESTS ====================
  describe('runWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const result = await manager.runWithRetry(mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on deadlock error', async () => {
      const deadlockError = new Error('Deadlock detected');
      const retriableOp = jest
        .fn()
        .mockRejectedValueOnce(deadlockError)
        .mockResolvedValueOnce('success');

      const result = await manager.runWithRetry(retriableOp, 3);

      expect(result).toBe('success');
      expect(retriableOp).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const deadlockError = new Error('Deadlock detected');
      const failingOp = jest.fn().mockRejectedValue(deadlockError);

      await expect(manager.runWithRetry(failingOp, 2)).rejects.toThrow(
        'Deadlock detected',
      );

      expect(failingOp).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-deadlock errors', async () => {
      const normalError = new Error('Normal error');
      const failingOp = jest.fn().mockRejectedValue(normalError);

      await expect(manager.runWithRetry(failingOp, 3)).rejects.toThrow(
        'Normal error',
      );

      expect(failingOp).toHaveBeenCalledTimes(1);
    });

    it('should log retry attempts', async () => {
      const debugSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation();

      await manager.runWithRetry(mockOperation, 3);

      expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('Attempt'));
    });

    it('should log deadlock warnings', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      const deadlockError = new Error('Deadlock detected');
      const retriableOp = jest
        .fn()
        .mockRejectedValueOnce(deadlockError)
        .mockResolvedValueOnce('success');

      await manager.runWithRetry(retriableOp, 3);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Deadlock detected'),
      );
    });
  });

  // ==================== RUN PARALLEL TESTS ====================
  describe('runParallel', () => {
    it('should execute operations in parallel', async () => {
      const op1 = jest.fn().mockResolvedValue('result1');
      const op2 = jest.fn().mockResolvedValue('result2');
      const op3 = jest.fn().mockResolvedValue('result3');

      const results = await manager.runParallel([op1, op2, op3]);

      expect(results).toEqual(['result1', 'result2', 'result3']);
    });

    it('should log parallel execution start', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const operations = [jest.fn().mockResolvedValue('r1')];

      await manager.runParallel(operations);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('parallel transactions'),
      );
    });

    it('should reject if any operation fails', async () => {
      const op1 = jest.fn().mockResolvedValue('result1');
      const op2 = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(manager.runParallel([op1, op2])).rejects.toThrow('Failed');
    });
  });

  // ==================== HEALTH CHECK TESTS ====================
  describe('healthCheck', () => {
    it('should return true when database is healthy', async () => {
      const result = await manager.healthCheck();

      expect(result).toBe(true);
      expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return false when database query fails', async () => {
      jest
        .spyOn(dataSource, 'query')
        .mockRejectedValue(new Error('Connection failed'));

      const result = await manager.healthCheck();

      expect(result).toBe(false);
    });

    it('should log health check failure', async () => {
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      jest
        .spyOn(dataSource, 'query')
        .mockRejectedValue(new Error('Connection failed'));

      await manager.healthCheck();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('health check failed'),
      );
    });
  });

  // ==================== GET ACTIVE CONNECTION COUNT TESTS ====================
  describe('getActiveConnectionCount', () => {
    it('should return 1 when data source is initialized', () => {
      const count = manager.getActiveConnectionCount();

      expect(count).toBe(1);
    });

    it('should return 0 when data source is not initialized', () => {
      Object.defineProperty(dataSource, 'isInitialized', {
        value: false,
      });

      const count = manager.getActiveConnectionCount();
      expect(count).toBe(0);
    });
  });
});
