// __tests__/infrastructure/generator/medical-record-number.generator.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { MedicalRecordNumberGenerator } from '../../../infrastructure/generator/medical-record-number.generator';
import { Patient } from '../../../domains/entities/patient.entity';

// 2. MOCK DATA
// Kita hardcode prefix ini karena kita akan membekukan waktu sistem ke tanggal ini.
const mockPrefix = '20231119';

// Mock Error Deadlock (MySQL code)
const mockDeadlockError = {
  code: 'ER_LOCK_DEADLOCK',
  message: 'Deadlock found when trying to get lock',
};

// 3. TEST SUITE
describe('MedicalRecordNumberGenerator', () => {
  let generator: MedicalRecordNumberGenerator;
  let dataSource: DataSource;

  // Mock Objects
  let mockQueryRunner: any;
  let mockQueryBuilder: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // A. FREEZE TIME
    // Kita kunci waktu ke 19 Nov 2023 jam 12 siang UTC.
    // Ini menjamin method getDatePrefix() di service selalu return '20231119'
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-11-19T12:00:00Z'));

    // B. Setup Mock QueryBuilder
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(), // Return value diatur per test case
      getCount: jest.fn(), // Untuk stats
    };

    // C. Setup Mock QueryRunner
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      },
    };

    // D. Setup Mock DataSource
    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordNumberGenerator,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    generator = module.get<MedicalRecordNumberGenerator>(MedicalRecordNumberGenerator);
    dataSource = module.get<DataSource>(DataSource);

    // E. MOCK SLEEP (CRITICAL FIX)
    // Kita meng-override method private 'sleep' agar resolve instan.
    // Ini mencegah timeout saat testing retry logic.
    jest.spyOn(generator as any, 'sleep').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS (generate)

  describe('generate', () => {
    it('should generate sequence 001 if no record exists for today', async () => {
      // Arrange
      mockQueryBuilder.getRawOne.mockResolvedValue(null); // Tidak ada data hari ini

      // Act
      const result = await generator.generate();

      // Assert
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(result).toBe(`${mockPrefix}-001`);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should increment sequence correctly (e.g., 005 -> 006)', async () => {
      // Arrange
      mockQueryBuilder.getRawOne.mockResolvedValue({
        nomor_rekam_medis: `${mockPrefix}-005`,
      });

      // Act
      const result = await generator.generate();

      // Assert
      expect(result).toBe(`${mockPrefix}-006`);
    });

    it('should throw InternalServerErrorException if limit (999) exceeded', async () => {
      // Arrange
      // Mock bahwa database mengembalikan sequence 999
      mockQueryBuilder.getRawOne.mockResolvedValue({
        nomor_rekam_medis: `${mockPrefix}-999`,
      });

      // Act & Assert
      // Karena logic calculateNextSequence sudah diperbaiki, 
      // dia akan return 1000, lalu throw error di generate()
      await expect(generator.generate()).rejects.toThrow(InternalServerErrorException);
      await expect(generator.generate()).rejects.toThrow('Gagal generate nomor rekam medis. Silakan coba lagi.');

      // Verify rollback
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    // --- RETRY LOGIC TEST ---

    it('should retry on DEADLOCK error and succeed eventually', async () => {
      // Arrange
      mockQueryBuilder.getRawOne
        .mockRejectedValueOnce(mockDeadlockError) // Gagal
        .mockResolvedValueOnce(null);             // Sukses

      // Act
      // Langsung await saja. Karena 'sleep' sudah di-mock resolve instan, 
      // dia tidak akan timeout lagi.
      const result = await generator.generate();

      // Assert
      expect(result).toBe(`${mockPrefix}-001`);
      expect(mockQueryRunner.manager.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should give up after MAX_RETRIES', async () => {
      // Arrange
      mockQueryBuilder.getRawOne.mockRejectedValue(mockDeadlockError);

      // Act & Assert
      await expect(generator.generate()).rejects.toThrow(InternalServerErrorException);

      // Verifikasi loop berjalan 5 kali
      expect(mockQueryRunner.manager.createQueryBuilder).toHaveBeenCalledTimes(5);
    });

    it('should fail immediately on non-retryable error', async () => {
      // Arrange
      const genericError = new Error('Database connection lost');
      mockQueryBuilder.getRawOne.mockRejectedValue(genericError);

      // Act & Assert
      await expect(generator.generate()).rejects.toThrow(InternalServerErrorException);

      // Tidak boleh retry, cukup 1 kali panggil
      expect(mockQueryRunner.manager.createQueryBuilder).toHaveBeenCalledTimes(1);
    });
  });

  // 6. SUB-GROUP TESTS (Static Methods & Stats)

  describe('Static Methods (Validation & Parsing)', () => {
    describe('isValidFormat', () => {
      it('should return true for valid format', () => {
        expect(MedicalRecordNumberGenerator.isValidFormat('20231119-001')).toBe(true);
      });

      it('should return false for invalid formats', () => {
        expect(MedicalRecordNumberGenerator.isValidFormat('2023-001')).toBe(false);
        expect(MedicalRecordNumberGenerator.isValidFormat('ABC-123')).toBe(false);
        expect(MedicalRecordNumberGenerator.isValidFormat('20231119-1')).toBe(false);
      });
    });

    describe('parse', () => {
      it('should parse valid RM string', () => {
        const result = MedicalRecordNumberGenerator.parse('20231119-050');
        expect(result).not.toBeNull();
        expect(result?.sequence).toBe(50);
        expect(result?.date.getFullYear()).toBe(2023);
        expect(result?.date.getMonth()).toBe(10); // Bulan 11 (index 10)
        expect(result?.date.getDate()).toBe(19);
      });

      it('should return null for invalid string', () => {
        expect(MedicalRecordNumberGenerator.parse('invalid')).toBeNull();
      });
    });
  });

  describe('getDailyStatistics', () => {
    it('should calculate stats correctly', async () => {
      // Arrange
      const currentCount = 500;
      const maxDaily = 999;
      mockQueryBuilder.getCount.mockResolvedValue(currentCount);

      // Act
      const stats = await generator.getDailyStatistics();

      // Assert
      expect(dataSource.getRepository).toHaveBeenCalledWith(Patient);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('LIKE :pattern'),
        { pattern: `${mockPrefix}-%` }
      );

      expect(stats.total).toBe(currentCount);
      expect(stats.remaining).toBe(maxDaily - currentCount); // 499

      // Hitung persentase: (500 / 999) * 100 = 50.05...
      const expectedPercent = Math.round((currentCount / maxDaily) * 100 * 100) / 100;
      expect(stats.percentage).toBe(expectedPercent);
    });
  });
});