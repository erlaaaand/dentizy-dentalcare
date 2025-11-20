import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AppointmentTimeValidator } from '../appointment-time.validator';

describe('AppointmentTimeValidator', () => {
  let validator: AppointmentTimeValidator;

  // Tentukan waktu tiruan (mock)
  const MOCK_TODAY = new Date('2024-10-20T10:00:00.000Z');

  // --- PERBAIKAN 1: MOCKING WAKTU ---
  beforeAll(() => {
    // Gunakan waktu tiruan
    jest.useFakeTimers();
    // Setel waktu sistem ke MOCK_TODAY
    jest.setSystemTime(MOCK_TODAY);
  });

  afterAll(() => {
    // Kembalikan ke waktu normal setelah semua tes selesai
    jest.useRealTimers();
  });
  // --- AKHIR PERBAIKAN 1 ---

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentTimeValidator],
    }).compile();

    validator = module.get<AppointmentTimeValidator>(AppointmentTimeValidator);
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  describe('validateDateNotInPast', () => {
    it('should pass for today date', () => {
      // new Date() sekarang akan selalu mengembalikan MOCK_TODAY
      const today = new Date();
      // Validator juga akan menggunakan MOCK_TODAY
      expect(() => validator.validateDateNotInPast(today)).not.toThrow();
    });

    it('should pass for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      expect(() => validator.validateDateNotInPast(futureDate)).not.toThrow();
    });

    it('should throw error for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // 19 Oktober 2024

      expect(() => validator.validateDateNotInPast(pastDate)).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateDateNotInPast(pastDate)).toThrow(
        'Tanggal janji temu tidak boleh di masa lalu',
      );
    });
  });

  describe('validateWorkingHours', () => {
    it('should pass for valid working hours', () => {
      const validTimes = [
        '08:00:00',
        '09:30:00',
        '12:00:00',
        '14:30:00',
        '16:00:00',
        '16:30:00',
      ];

      validTimes.forEach((time) => {
        expect(() => validator.validateWorkingHours(time)).not.toThrow();
      });
    });

    it('should throw error for time before 08:00', () => {
      const earlyTimes = ['07:59:00', '07:00:00', '06:30:00'];

      earlyTimes.forEach((time) => {
        expect(() => validator.validateWorkingHours(time)).toThrow(
          BadRequestException,
        );
        expect(() => validator.validateWorkingHours(time)).toThrow(
          /Jam janji harus antara/,
        );
      });
    });

    it('should throw error for time after 16:30', () => {
      const lateTimes = ['16:31:00', '17:00:00', '18:00:00'];

      lateTimes.forEach((time) => {
        expect(() => validator.validateWorkingHours(time)).toThrow(
          BadRequestException,
        );
      });
    });

    it('should pass for exactly 16:30', () => {
      expect(() => validator.validateWorkingHours('16:30:00')).not.toThrow();
    });

    it('should pass for exactly 08:00', () => {
      expect(() => validator.validateWorkingHours('08:00:00')).not.toThrow();
    });
  });

  describe('formatTimeString', () => {
    // ... Tidak ada perubahan, blok ini sudah benar ...
    it('should format time correctly with padding', () => {
      const date = new Date('2024-01-01T09:05:03');
      const result = validator.formatTimeString(date);
      expect(result).toBe('09:05:03');
    });

    it('should format time with double digits', () => {
      const date = new Date('2024-01-01T14:30:45');
      const result = validator.formatTimeString(date);
      expect(result).toBe('14:30:45');
    });
  });

  describe('calculateBufferWindow', () => {
    // ... Tidak ada perubahan, blok ini sudah benar ...
    it('should calculate 30 minute buffer correctly', () => {
      const tanggalJanji = new Date('2024-11-20');
      const jamJanji = '10:00:00';

      const result = validator.calculateBufferWindow(tanggalJanji, jamJanji);

      expect(result.bufferStart).toBe('09:30:00');
      expect(result.bufferEnd).toBe('10:30:00');
      expect(result.appointmentDateTime).toBeInstanceOf(Date);
    });

    it('should handle time without seconds', () => {
      const tanggalJanji = new Date('2024-11-20');
      const jamJanji = '10:00';

      const result = validator.calculateBufferWindow(tanggalJanji, jamJanji);

      expect(result.bufferStart).toBe('09:30:00');
      expect(result.bufferEnd).toBe('10:30:00');
    });
  });

  describe('hasTimeConflict', () => {
    // ... Tidak ada perubahan, blok ini sudah benar ...
    it('should detect conflict within 30 minutes', () => {
      expect(validator.hasTimeConflict('10:00:00', '10:15:00')).toBe(true);
      expect(validator.hasTimeConflict('10:00:00', '10:29:00')).toBe(true);
    });

    it('should not detect conflict beyond buffer', () => {
      expect(validator.hasTimeConflict('10:00:00', '10:30:00')).toBe(false);
      expect(validator.hasTimeConflict('10:00:00', '09:30:00')).toBe(false);
    });
  });

  describe('validateAppointmentTime', () => {
    // ... Blok ini sudah benar ...
    it('should pass for valid future date and working hours', () => {
      const futureDate = new Date(); // Ini adalah MOCK_TODAY
      futureDate.setDate(futureDate.getDate() + 7); // 27 Oktober 2024
      const dateString = futureDate.toISOString().split('T')[0];

      expect(() =>
        validator.validateAppointmentTime(dateString, '10:00:00'),
      ).not.toThrow();
    });

    it('should throw error for past date', () => {
      const pastDate = '2020-01-01'; // Jelas masa lalu

      expect(() =>
        validator.validateAppointmentTime(pastDate, '10:00:00'),
      ).toThrow(BadRequestException);
    });

    it('should throw error for invalid working hours', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // 21 Oktober 2024
      const dateString = futureDate.toISOString().split('T')[0];

      expect(() =>
        validator.validateAppointmentTime(dateString, '17:00:00'),
      ).toThrow(BadRequestException);
    });

    it('should pass for today with valid hours', () => {
      // new Date() akan menjadi MOCK_TODAY (20 Okt 2024)
      const todayString = new Date().toISOString().split('T')[0];

      // Di dalam validator, new Date() juga 20 Okt 2024
      // Perbandingan 20 Okt < 20 Okt akan false (setelah setHours(0,0,0,0))
      expect(() =>
        validator.validateAppointmentTime(todayString, '14:00:00'),
      ).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle Date object input correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      expect(() => validator.validateDateNotInPast(futureDate)).not.toThrow();
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2024-01-01T00:00:00');
      const result = validator.formatTimeString(date);
      expect(result).toBe('00:00:00');
    });

    it('should handle time boundaries correctly', () => {
      expect(() => validator.validateWorkingHours('07:59:59')).toThrow();
      expect(() => validator.validateWorkingHours('08:00:00')).not.toThrow();
      expect(() => validator.validateWorkingHours('16:30:00')).not.toThrow();

      // --- PERBAIKAN 3: UBAH TES UNTUK MENANGKAP BUG ---
      // Tes ini SEKARANG AKAN GAGAL sampai Anda memperbaiki
      // implementasi 'validateWorkingHours' untuk menghitung detik.
      expect(() => validator.validateWorkingHours('16:30:01')).toThrow();
      // --- AKHIR PERBAIKAN 3 ---
    });
  });
});