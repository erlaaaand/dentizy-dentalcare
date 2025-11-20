// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { TransactionManager } from '../../../infrastructure/transactions/transaction.manager';

// 2. MOCK DATA
const mockSuccessResult = { id: 1, status: 'success' };

const mockDeadlockError = {
  code: 'ER_LOCK_DEADLOCK',
  message: 'Deadlock found when trying to get lock',
};

const mockTimeoutError = {
  code: 'ER_LOCK_WAIT_TIMEOUT',
  message: 'Lock wait timeout exceeded',
};

const mockGenericError = new Error('Database connection failed');

// 3. TEST SUITE
describe('TransactionManager', () => {
  let manager: TransactionManager;
  let dataSource: DataSource;
  let mockQueryRunner: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // A. Setup Mock QueryRunner
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };

    // B. Setup Mock DataSource
    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionManager,
        { provide: DataSource, useValue: mockDataSource },
      ],
    })
      .setLogger({ log: jest.fn(), error: jest.fn(), warn: jest.fn() })
      .compile();

    manager = module.get<TransactionManager>(TransactionManager);
    dataSource = module.get<DataSource>(DataSource);

    // C. PERBAIKAN UTAMA: Mock Global setTimeout
    // Alih-alih menggunakan jest.useFakeTimers(), kita override setTimeout
    // agar callback-nya langsung dieksekusi tanpa menunggu.
    // Ini membuat backoff time (100ms, 200ms...) menjadi 0ms.
    jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      if (typeof callback === 'function') {
        callback();
      }
      return { hasRef: () => false } as any; // Return dummy timer object
    });
  });

  afterEach(() => {
    jest.useRealTimers(); // Reset timer
    jest.clearAllMocks(); // PENTING: Reset hitungan panggilan mock (agar kembali ke 0)
  });

  it('should be defined', () => {
    expect(manager).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('executeWithRetry - Success Scenarios', () => {
    it('should execute operation successfully and commit transaction', async () => {
      const mockOperation = jest.fn().mockResolvedValue(mockSuccessResult);

      const result = await manager.executeWithRetry(mockOperation);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockOperation).toHaveBeenCalledWith(mockQueryRunner);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockSuccessResult);
    });
  });

  describe('executeWithRetry - Non-Retryable Errors', () => {
    it('should rollback and re-throw ConflictException immediately', async () => {
      const conflictError = new ConflictException('Duplicate entry');
      const mockOperation = jest.fn().mockRejectedValue(conflictError);

      await expect(manager.executeWithRetry(mockOperation)).rejects.toThrow(ConflictException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(dataSource.createQueryRunner).toHaveBeenCalledTimes(1); // No retry
    });

    it('should wrap generic errors into BadRequestException and stop', async () => {
      const mockOperation = jest.fn().mockRejectedValue(mockGenericError);

      await expect(manager.executeWithRetry(mockOperation)).rejects.toThrow(BadRequestException);
      await expect(manager.executeWithRetry(mockOperation)).rejects.toThrow('Operasi gagal dilakukan');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  // 6. SUB-GROUP TESTS (Retry Logic) - BAGIAN YANG SEBELUMNYA TIMEOUT

  describe('executeWithRetry - Retry Mechanism', () => {
    it('should retry on DEADLOCK error and eventually succeed', async () => {
      // Arrange
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(mockDeadlockError) // Percobaan 1: Gagal
        .mockResolvedValueOnce(mockSuccessResult); // Percobaan 2: Sukses

      // Act
      // Tidak perlu jest.runAllTimers() lagi karena setTimeout sudah di-mock instan
      const result = await manager.executeWithRetry(mockOperation);

      // Assert
      expect(result).toEqual(mockSuccessResult);

      // Verifikasi Retry Count (1 gagal + 1 sukses = 2 kali panggil)
      expect(dataSource.createQueryRunner).toHaveBeenCalledTimes(2);
      expect(mockOperation).toHaveBeenCalledTimes(2);

      // Verifikasi flow rollback lalu commit
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    });

    it('should retry on LOCK TIMEOUT error', async () => {
      // Arrange
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(mockTimeoutError)
        .mockResolvedValueOnce(mockSuccessResult);

      // Act
      const result = await manager.executeWithRetry(mockOperation);

      // Assert
      expect(result).toEqual(mockSuccessResult);
      expect(dataSource.createQueryRunner).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException after MAX_RETRY_ATTEMPTS exceeded', async () => {
      const mockOperation = jest.fn().mockRejectedValue(mockDeadlockError);
      await expect(manager.executeWithRetry(mockOperation)).rejects.toThrow('Operasi gagal setelah beberapa percobaan');
      expect(dataSource.createQueryRunner).toHaveBeenCalledTimes(5);
    });
  });
});